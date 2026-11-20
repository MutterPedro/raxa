import { inject, injectable } from 'inversify';
import { TYPES } from '../../infra/di';
import { UserRepository } from '../repositories/UserRepository';
import User, { UserProps } from '../entities/User';
import { synchronized } from '../utils/decorators';

@injectable()
export class UserService {
  private static RESERVED_SELF_ID = 1337;

  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepo: UserRepository,
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
    user.email = 'placeholder@email.com';
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
    await this.userRepo.setLoggedSignUp(updated, password);

    return updated;
  }

  /**
   * Password login. Firebase is verified first, so a wrong password never touches
   * local rows. An email without a local user (fresh device pre-sync) claims the
   * reserved self row rather than failing.
   */
  async login(email: string, password: string): Promise<User> {
    await this.userRepo.authenticateWithPassword(email, password);

    const found = await this.userRepo.findByEmail(email);
    const user = found ?? (await this.adoptSelfEmail(email));
    this.userRepo.setLogged(user);

    return user;
  }

  /**
   * Google login: the popup yields the profile, so an email new locally gets a user
   * created on the spot (name and email come pre-verified from the provider).
   */
  async loginWithGoogle(): Promise<User> {
    const creds = await this.userRepo.authenticateWithGoogle();

    const found = await this.userRepo.findByEmail(creds.email);
    if (found) {
      this.userRepo.setLogged(found);
      return found;
    }

    const created = await this.createUser({ name: creds.name, email: creds.email });
    this.userRepo.setLogged(created);
    return created;
  }

  private async adoptSelfEmail(email: string): Promise<User> {
    const self = await this.createSelf();
    self.email = email;
    return this.userRepo.save(self);
  }
}
