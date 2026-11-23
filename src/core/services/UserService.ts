import { inject, injectable } from 'inversify';
import { TYPES } from '../../infra/di';
import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { UserRepository } from '../repositories/UserRepository';
import User, { UserProps } from '../entities/User';
import { ExpenseProps } from '../entities/Expense';
import { synchronized } from '../utils/decorators';

import type { SessionCredentials } from '../../infra/SessionManager';
import type { WithId } from '../../@types/utils';

/** The provider data an adoption writes onto a local row (name excluded on purpose). */
type ProviderProfile = Pick<SessionCredentials, 'uid' | 'email' | 'picture'>;

@injectable()
export class UserService {
  private static RESERVED_SELF_ID = 1337;
  private static PLACEHOLDER_SELF_EMAIL = 'placeholder@email.com';

  private readonly loggedUserListeners = new Set<(user: WithId<User> | null) => void>();

  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepo: UserRepository,
    @inject(TYPES.ExpenseRepository)
    private readonly expenseRepo: ExpenseRepository,
  ) {}

  async createUser(values: Omit<UserProps, 'id'>): Promise<User> {
    const user = new User();
    user.name = values.name;
    user.email = values.email;
    return this.userRepo.save(user);
  }

  @synchronized()
  async createSelf(): Promise<User> {
    const self = await this.userRepo.getById(UserService.RESERVED_SELF_ID);
    if (self) {
      return self;
    }

    const user = new User();
    user.name = 'Eu';
    user.email = UserService.PLACEHOLDER_SELF_EMAIL;
    user.id = UserService.RESERVED_SELF_ID;
    return this.userRepo.create(user);
  }

  async getUsers(): Promise<User[]> {
    return this.userRepo.list(1);
  }

  async getByIds(ids: number[]): Promise<User[]> {
    const list = await Promise.all(ids.map((id) => this.userRepo.getById(id)));
    return list.filter((u) => !!u);
  }

  async signUp(email: string, password: string, name: string): Promise<User> {
    const self = await this.createSelf();
    self.email = email;
    self.name = name;

    const updated = await this.userRepo.save(self);
    const uid = await this.userRepo.setLoggedSignUp(updated, password);
    updated.firebase_uid = uid;
    const signedUp = await this.userRepo.save(updated);
    this.notifyLoggedUser(signedUp);
    return signedUp;
  }

  /**
   * Password login. Firebase is verified first, so a wrong password never touches
   * local rows. An email without a local user (fresh device pre-sync) claims the
   * reserved self row rather than failing.
   */
  async login(email: string, password: string): Promise<User> {
    const uid = await this.userRepo.authenticateWithPassword(email, password);

    const found = await this.userRepo.findByEmail(email);
    const user = found ?? (await this.adoptSelfEmail(email, uid));
    await this.bindUid(user, uid);
    this.markLoggedIn(user);

    return user;
  }

  /**
   * Google login: the popup yields the profile. A never-adopted self row *is* this
   * person — every bill and expense already references it — so the provider identity
   * lands there (the friendly name stays 'Eu') instead of creating a second row for
   * the same human.
   */
  async loginWithGoogle(): Promise<User> {
    const creds = await this.userRepo.authenticateWithGoogle();

    const found = await this.resolveLocalUser(creds.uid, creds.email);
    if (!found) {
      const self = await this.createSelf();
      if (this.isPlaceholderSelf(self)) {
        const claimed = await this.adoptIntoSelf(self, creds);
        this.markLoggedIn(claimed);
        return claimed;
      }

      const created = await this.createUser({ name: creds.name, email: creds.email });
      await this.bindUid(created, creds.uid);
      const withPicture = await this.bindPicture(created, creds.picture);
      this.markLoggedIn(withPicture);
      return withPicture;
    }

    const user = await this.bindProviderRow(found, creds);
    this.markLoggedIn(user);
    return user;
  }

  /** The local user currently logged in, or null when nobody is. */
  getLoggedUser(): Promise<WithId<User> | null> {
    return this.userRepo.getLogged();
  }

  /**
   * Boot-time session restore: Firebase persists its own session across reloads,
   * so if one is still alive the matching local row is logged back in. When the
   * account is unknown locally (data cleared, never logged in here) nobody is
   * logged in — an active Firebase session alone is not a local account.
   */
  async restoreSession(): Promise<User | null> {
    const current = await this.userRepo.currentUser();
    if (!current) {
      this.userRepo.clearLogged();
      this.notifyLoggedUser(null);
      return null;
    }

    const byUid = await this.userRepo.findByUid(current.uid);
    const byEmail = byUid ? undefined : await this.userRepo.findByEmail(current.email);
    const user = byUid ?? byEmail;
    if (!user) {
      return null;
    }

    const restored = await this.bindProviderRow(user, current);
    this.markLoggedIn(restored);
    return restored;
  }

  /**
   * Subscribes to every logged-user change (login, signup, restore, clear). The
   * header and sync hint live outside the router, so an in-app login never
   * remounts them — they subscribe here to flip without waiting for a reload.
   */
  subscribeLoggedUser(listener: (user: WithId<User> | null) => void): () => void {
    this.loggedUserListeners.add(listener);
    return () => {
      this.loggedUserListeners.delete(listener);
    };
  }

  private markLoggedIn(user: WithId<User>): void {
    this.userRepo.setLogged(user);
    this.notifyLoggedUser(user);
  }

  private notifyLoggedUser(user: WithId<User> | null): void {
    for (const listener of this.loggedUserListeners) {
      listener(user);
    }
  }

  private async adoptSelfEmail(email: string, uid: string): Promise<User> {
    const self = await this.createSelf();
    self.email = email;
    self.firebase_uid = uid;
    return this.userRepo.save(self);
  }

  /** The uid is the stable identity; the email is only a fallback handle. */
  private async resolveLocalUser(uid: string, email: string): Promise<WithId<User> | undefined> {
    return (await this.userRepo.findByUid(uid)) ?? (await this.userRepo.findByEmail(email));
  }

  private bindUid(user: WithId<User>, uid: string): Promise<WithId<User>> {
    if (user.firebase_uid === uid) {
      return Promise.resolve(user);
    }
    user.firebase_uid = uid;
    return this.userRepo.save(user);
  }

  /** Keeps the stored profile picture current (provider URLs rotate); no write when unchanged. */
  private bindPicture(user: WithId<User>, picture: string): Promise<WithId<User>> {
    if (!picture || user.photo_url === picture) {
      return Promise.resolve(user);
    }
    user.photo_url = picture;
    return this.userRepo.save(user);
  }

  /** The self row as it came from the app, never claimed by an account. */
  private isPlaceholderSelf(user: User): boolean {
    return !user.firebase_uid && user.email === UserService.PLACEHOLDER_SELF_EMAIL;
  }

  private async getPlaceholderSelf(): Promise<WithId<User> | undefined> {
    const self = await this.userRepo.getById(UserService.RESERVED_SELF_ID);
    return self && this.isPlaceholderSelf(self) ? self : undefined;
  }

  /**
   * Gives the provider's account to the self row: email, uid and picture move over
   * while the familiar `Eu` name stays put. Expenses already pointing at the self row
   * need no change, so the avatar shows up everywhere at once.
   */
  private adoptIntoSelf(self: WithId<User>, creds: ProviderProfile): Promise<WithId<User>> {
    self.email = creds.email;
    self.firebase_uid = creds.uid;
    self.photo_url = creds.picture;
    return this.userRepo.save(self);
  }

  /**
   * Rows created before the self row was adopted, or by an earlier provider login, are
   * the same human twice. The provider data moves to whichever row is already referenced
   * (the self row when it is still unclaimed, otherwise the row found), and the other one
   * goes away with its expense references rewritten onto the survivor.
   */
  private async bindProviderRow(found: WithId<User>, creds: ProviderProfile): Promise<WithId<User>> {
    if (found.id === UserService.RESERVED_SELF_ID) {
      await this.bindUid(found, creds.uid);
      return this.bindPicture(found, creds.picture);
    }

    const self = await this.getPlaceholderSelf();
    if (self) {
      const claimed = await this.adoptIntoSelf(self, creds);
      await this.repointExpenses(found.id, claimed.id);
      await this.userRepo.delete(found.id);
      return claimed;
    }

    await this.bindUid(found, creds.uid);
    return this.bindPicture(found, creds.picture);
  }

  /** Moves every expense naming the dropped row (payer or participant) to the survivor. */
  private async repointExpenses(droppedId: number, survivorId: number): Promise<void> {
    const namesDropped = (expense: WithId<ExpenseProps>) =>
      expense.payerId === droppedId || expense.participantIds.includes(droppedId);

    // Every save stops the row from matching, so page 1 is re-queried until it comes back empty.
    let matches = await this.expenseRepo.searchPage(namesDropped, 1);
    while (matches.length > 0) {
      await Promise.all(
        matches.map((expense) => {
          if (expense.payerId === droppedId) expense.payerId = survivorId;
          expense.participantIds = Array.from(
            new Set(expense.participantIds.map((id) => (id === droppedId ? survivorId : id))),
          );
          return this.expenseRepo.save(expense);
        }),
      );
      matches = await this.expenseRepo.searchPage(namesDropped, 1);
    }
  }
}
