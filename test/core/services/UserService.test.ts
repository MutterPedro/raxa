import casual from 'casual';
import Expense from '../../../src/core/entities/Expense';
import { createExpense } from '../../factories/entities';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';
import { SessionManagerFake } from '../fakes/SessionManager.fake';
import { ExpenseProps, UserProps } from '../../../src/core/entities';
import { ExpenseRepositoryFake } from '../fakes/ExpenseRepository.fake';
import { UserRepositoryFake } from '../fakes/UserRepository.fake';
import { UserService } from '../../../src/core/services/UserService';

/**
 * The worlds the scenarios arrange on top of. Every factory clears the repository's
 * process-wide logged-in marker, so no test inherits a session from whoever ran
 * before it (the marker lives in a static, shared across instances).
 */
function arrange() {
  const conn = MemoryDBConnection.build<UserProps>();
  const expenseConn = MemoryDBConnection.build<ExpenseProps>();
  const session = SessionManagerFake.build();
  const repo = UserRepositoryFake.build(conn, session);
  repo.clearLogged();
  const expenseRepo = ExpenseRepositoryFake.build(expenseConn);
  const service = new UserService(repo, expenseRepo);

  return { conn, expenseConn, session, repo, expenseRepo, service };
}

/** arrange: one expense with the given payer and participants. */
async function arrangeExpense(expenseRepo: ExpenseRepositoryFake, overrides: Partial<Expense>) {
  // id 0 sends BaseRepository.save down the create path (the factory default id is 1).
  return expenseRepo.save(createExpense({ id: 0, ...overrides }));
}

/** arrange: one local user that never signed in (no firebase uid bound yet). */
async function arrangeLocalUser(email = casual.email) {
  const world = arrange();
  const user = await world.service.createUser({ name: casual.name, email });

  return { ...world, user };
}

/** arrange: a user logged in with a password in this process (uid `uid-<email>`). */
async function arrangePasswordLoggedIn(email = casual.email) {
  const world = await arrangeLocalUser(email);
  const user = await world.service.login(email, 'some-password');

  return { ...world, user };
}

describe('UserService.ts', function () {
  describe('Unit tests', function () {
    it('should add a new user #unit', async function () {
      const { conn, service } = arrange();
      const name = casual.name;
      const email = casual.email;

      const user = await service.createUser({ name, email });

      expect(user.name).toBe(name);
      expect(user.email).toBe(email);
      expect(user.id).toBeGreaterThan(0);
      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].id).toBe(user.id);
    });

    it("should create the self user if it doesn't exist #unit", async function () {
      const { conn, service } = arrange();

      const self = await service.createSelf();
      const again = await service.createSelf();

      expect(self.name).toBe('Eu');
      expect(again.id).toBe(self.id);
      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].id).toBe(self.id);
    });

    it('should list all the users #unit', async function () {
      const { service } = arrange();
      const created = await Promise.all(
        ['ana', 'beto', 'caio'].map((key) => service.createUser({ name: key, email: `${key}@email.com` })),
      );

      const users = await service.getUsers();

      expect(users.map((u) => u.id)).toEqual(expect.arrayContaining(created.map((u) => u.id)));
      expect(users).toHaveLength(3);
    });

    it('should sign up the self user #unit', async function () {
      const { conn, service } = arrange();
      for (let i = 0; i < 5; i++) {
        await service.createUser({ name: casual.name, email: casual.email });
      }
      const email = casual.email;

      const user = await service.signUp(email, 'some-password', 'Novo Nome');

      expect(user.email).toBe(email);
      expect(user.name).toBe('Novo Nome');
      expect(user.logged_in).toBe(true);
      expect(user.firebase_uid).toBe(`uid-${email}`);
      expect(conn.items).toHaveLength(6);
      expect(conn.items[conn.items.length - 1].id).toBe(user.id);
      // Sign up claimed the self row: it now is this user.
      expect(await service.createSelf()).toStrictEqual(user);
    });

    it('should get users by their ids, skipping the missing ones #unit', async function () {
      const { service } = arrange();
      const user1 = await service.createUser({ name: casual.name, email: casual.email });
      const user2 = await service.createUser({ name: casual.name, email: casual.email });

      const users = await service.getByIds([user1.id, 123456, user2.id]);
      const empty = await service.getByIds([]);

      expect(users.map((u) => u.id)).toEqual([user1.id, user2.id]);
      expect(empty).toHaveLength(0);
    });

    it('should log an existing user in with a password #unit', async function () {
      const { conn, session, service, user } = await arrangeLocalUser();

      const logged = await service.login(user.email, 'some-password');

      expect(logged.id).toBe(user.id);
      expect(logged.logged_in).toBe(true);
      expect(session.credentials).toEqual([{ email: user.email, password: 'some-password' }]);
      // The uid is bound to the row for later restores, and no row is added:
      // login marks the session, it does not clone the user.
      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].firebase_uid).toBe(`uid-${user.email}`);
    });

    it('should claim the self row when a password login arrives without a local user #unit', async function () {
      const { conn, service } = arrange();

      const user = await service.login('someone@newdevice.com', 'some-password');

      expect(user.id).toBe(1337);
      expect(user.email).toBe('someone@newdevice.com');
      expect(user.logged_in).toBe(true);
      expect(conn.items).toHaveLength(1);
    });

    it('should leave local rows untouched when the password is wrong #unit', async function () {
      const { conn, session, service, user } = await arrangeLocalUser();
      session.loginError = { code: 'auth/wrong-password' };

      await expect(service.login(user.email, 'nope')).rejects.toEqual({ code: 'auth/wrong-password' });

      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].email).toBe(user.email);
    });

    it('should log in with Google reusing the user that has the email #unit', async function () {
      const { conn, session, service, user } = await arrangeLocalUser('ana@gmail.com');
      session.googleCreds = { uid: 'ana-google-uid', email: 'ana@gmail.com', name: 'Ana', picture: '' };

      const logged = await service.loginWithGoogle();

      expect(logged.id).toBe(user.id);
      expect(logged.logged_in).toBe(true);
      // The uid becomes the stable identity persisted on the row.
      expect(conn.items[0].firebase_uid).toBe('ana-google-uid');
    });

    it('should log in with Google claiming the self row when the email is new locally #unit', async function () {
      const { conn, session, service } = arrange();
      session.googleCreds = { uid: 'novo-google-uid', email: 'novo@gmail.com', name: 'Novo Usuario', picture: '' };

      const logged = await service.loginWithGoogle();

      // The provider account lands on the self row every bill already references; the
      // friendly name stays 'Eu' instead of the Google display name.
      expect(logged.id).toBe(1337);
      expect(logged.name).toBe('Eu');
      expect(logged.email).toBe('novo@gmail.com');
      expect(logged.logged_in).toBe(true);
      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].firebase_uid).toBe('novo-google-uid');
    });

    it('should fold a duplicate provider row into the self row on google login #unit', async function () {
      const { conn, session, repo, expenseConn, expenseRepo, service } = arrange();
      // Deployed devices hold both rows: the untouched self row and the Google row
      // created by earlier logins, with expenses on each side.
      const self = await service.createSelf();
      const dup = await service.createUser({ name: 'Pedro', email: 'pedro@gmail.com' });
      dup.firebase_uid = 'pedro-google-uid';
      await repo.save(dup);
      const payerExpense = await arrangeExpense(expenseRepo, { payerId: dup.id, participantIds: [self.id, dup.id] });
      const selfExpense = await arrangeExpense(expenseRepo, { payerId: self.id, participantIds: [self.id] });
      const otherExpense = await arrangeExpense(expenseRepo, { payerId: 99, participantIds: [99, dup.id] });
      session.googleCreds = {
        uid: 'pedro-google-uid',
        email: 'pedro@gmail.com',
        name: 'Pedro',
        picture: 'https://lh3.googleusercontent.com/a/pedro',
      };

      const logged = await service.loginWithGoogle();

      expect(logged.id).toBe(1337);
      expect(logged.name).toBe('Eu');
      expect(logged.photo_url).toBe('https://lh3.googleusercontent.com/a/pedro');
      // The duplicate is gone, and only the survivor keeps its uid.
      expect(conn.items.map((u) => u.id)).toEqual([1337]);
      // Expenses keep pointing at one row: the payer moves, participants dedupe.
      const [payerRow] = expenseConn.items.filter((e) => e.id === payerExpense.id);
      expect(payerRow.payerId).toBe(1337);
      expect(payerRow.participantIds).toEqual([self.id]); // the dropped id folds in, leaving one reference
      const [selfRow] = expenseConn.items.filter((e) => e.id === selfExpense.id);
      expect(selfRow.payerId).toBe(self.id);
      expect(selfRow.participantIds).toEqual([self.id]);
      // Expenses paid by someone else also move the participant reference.
      const [otherRow] = expenseConn.items.filter((e) => e.id === otherExpense.id);
      expect(otherRow.payerId).toBe(99);
      expect(otherRow.participantIds).toEqual([99, self.id]);
    });

    it('should fold the duplicate row into the self row when restoring a session #unit', async function () {
      const { conn, session, repo, service } = arrange();
      const self = await service.createSelf();
      const dup = await service.createUser({ name: 'Pedro', email: 'pedro@gmail.com' });
      dup.firebase_uid = 'pedro-google-uid';
      await repo.save(dup);
      session.currentUser = {
        uid: 'pedro-google-uid',
        email: 'pedro@gmail.com',
        name: 'Pedro',
        picture: 'https://lh3.googleusercontent.com/a/pedro',
      };

      const restored = await service.restoreSession();

      // A reload on a device that still has the old duplicate self-heals onto 'Eu'.
      expect(restored?.id).toBe(self.id);
      expect(restored?.name).toBe('Eu');
      expect(restored?.photo_url).toBe('https://lh3.googleusercontent.com/a/pedro');
      expect(conn.items.map((u) => u.id)).toEqual([1337]);

      // Restoring again over the claimed self row only refreshes it.
      session.currentUser = { ...session.currentUser, picture: 'https://lh3.googleusercontent.com/a/pedro-2' };
      const again = await service.restoreSession();
      expect(again?.id).toBe(1337);
      expect(again?.photo_url).toBe('https://lh3.googleusercontent.com/a/pedro-2');
      expect(conn.items).toHaveLength(1);
    });

    it('should create a separate row for a new google account when the self row has an owner #unit', async function () {
      const { conn, session, repo, service } = arrange();
      const self = await service.createSelf();
      self.firebase_uid = 'someone-else-uid';
      self.email = 'outra@gmail.com';
      await repo.save(self);
      session.googleCreds = {
        uid: 'terceiro-uid',
        email: 'terceiro@gmail.com',
        name: 'Terceiro',
        picture: 'https://lh3.googleusercontent.com/a/terceiro',
      };

      const logged = await service.loginWithGoogle();

      // Another person owns 'Eu', so this account gets its own row.
      expect(logged.id).not.toBe(self.id);
      expect(logged.name).toBe('Terceiro');
      expect(logged.photo_url).toBe('https://lh3.googleusercontent.com/a/terceiro');
      expect(conn.items).toHaveLength(2);
    });

    it('should keep both rows when the self row already belongs to another account #unit', async function () {
      const { conn, session, repo, service } = arrange();
      const self = await service.createSelf();
      self.firebase_uid = 'someone-else-uid';
      self.email = 'outra@gmail.com';
      await repo.save(self);
      const dup = await service.createUser({ name: 'Pedro', email: 'pedro@gmail.com' });
      dup.firebase_uid = 'pedro-google-uid';
      await repo.save(dup);
      session.googleCreds = { uid: 'pedro-google-uid', email: 'pedro@gmail.com', name: 'Pedro', picture: '' };

      const logged = await service.loginWithGoogle();

      // Folding now would steal another person's rows, so both stay.
      expect(logged.id).toBe(dup.id);
      expect(conn.items).toHaveLength(2);
    });

    it('should persist the Google profile picture on the user row #unit', async function () {
      const { conn, session, service } = arrange();
      session.googleCreds = {
        uid: 'foto-google-uid',
        email: 'foto@gmail.com',
        name: 'Foto User',
        picture: 'https://lh3.googleusercontent.com/a/foto',
      };

      const logged = await service.loginWithGoogle();

      expect(logged.photo_url).toBe('https://lh3.googleusercontent.com/a/foto');
      expect(conn.items[0].photo_url).toBe('https://lh3.googleusercontent.com/a/foto');
    });

    it('should reject when the Google popup fails #unit', async function () {
      const { conn, session, service } = arrange();
      session.googleError = { code: 'auth/popup-closed-by-user' };

      await expect(service.loginWithGoogle()).rejects.toEqual({ code: 'auth/popup-closed-by-user' });

      expect(conn.items).toHaveLength(0);
    });

    it('should prefer the row bound to the uid over the email match on google login #unit', async function () {
      const { conn, session, repo, service } = arrange();
      const bound = await service.createUser({ name: 'Binded', email: 'bound@old.email' });
      bound.firebase_uid = 'google-uid';
      await repo.save(bound);
      await service.createUser({ name: 'Email Match', email: 'google.user@example.com' });
      session.googleCreds = { uid: 'google-uid', email: 'google.user@example.com', name: 'Google User', picture: '' };

      const logged = await service.loginWithGoogle();

      expect(logged.id).toBe(bound.id);
      expect(conn.items).toHaveLength(2);
    });

    it('should return nobody as the logged user before any login #unit', async function () {
      const { service } = arrange();

      expect(await service.getLoggedUser()).toBeNull();
    });

    it('should notify subscribers when a login changes the logged user #unit', async function () {
      const { service, user } = await arrangeLocalUser();
      const seen: unknown[] = [];
      service.subscribeLoggedUser((logged) => seen.push(logged?.id));

      const logged = await service.login(user.email, 'some-password');

      expect(seen).toEqual([logged.id]);
    });

    it('should notify subscribers when a restore finds no surviving session #unit', async function () {
      const { session, service } = await arrangePasswordLoggedIn();
      const seen: unknown[] = [];
      service.subscribeLoggedUser((logged) => seen.push(logged));
      session.currentUser = null;

      await service.restoreSession();

      expect(seen).toEqual([null]);
    });

    it('should stop notifying a subscriber after it unsubscribes #unit', async function () {
      const { service, user } = await arrangeLocalUser();
      const seen: unknown[] = [];
      const unsubscribe = service.subscribeLoggedUser((logged) => seen.push(logged));

      unsubscribe();
      await service.login(user.email, 'some-password');

      expect(seen).toHaveLength(0);
    });

    it('should restore a live session by uid after a reload #unit', async function () {
      const email = casual.email;
      const { repo, session, service, user } = await arrangePasswordLoggedIn(email);

      // Simulate a page reload: the in-memory marker is gone, the Firebase
      // session is still alive and the row carries the bound uid.
      repo.clearLogged();
      session.currentUser = { uid: `uid-${email}`, email, name: user.name, picture: '' };

      const restored = await service.restoreSession();

      expect(restored?.id).toBe(user.id);
      expect((await service.getLoggedUser())?.id).toBe(user.id);
    });

    it('should clear the logged user when no firebase session survives #unit', async function () {
      const { session, service } = await arrangePasswordLoggedIn();

      session.currentUser = null;

      expect(await service.restoreSession()).toBeNull();
      expect(await service.getLoggedUser()).toBeNull();
    });

    it('should adopt the email match and bind the uid when restoring #unit', async function () {
      const { conn, session, service, user } = await arrangeLocalUser('sem.uid@email.com');
      // Row predates uid binding (created before this feature, or on another device).
      session.currentUser = { uid: 'fresh-uid', email: 'sem.uid@email.com', name: 'Sem Uid', picture: '' };

      const restored = await service.restoreSession();

      expect(restored?.id).toBe(user.id);
      expect(conn.items[0].firebase_uid).toBe('fresh-uid');
    });

    it('should refresh the stored picture with the live session one when restoring #unit', async function () {
      const email = casual.email;
      const { conn, session, service } = await arrangePasswordLoggedIn(email);
      session.currentUser = {
        uid: `uid-${email}`,
        email,
        name: 'Qualquer',
        picture: 'https://lh3.googleusercontent.com/a/nova',
      };

      const restored = await service.restoreSession();

      expect(restored?.photo_url).toBe('https://lh3.googleusercontent.com/a/nova');
      expect(conn.items[0].photo_url).toBe('https://lh3.googleusercontent.com/a/nova');
    });

    it('should not create a user when restoring an unknown account #unit', async function () {
      const { conn, session, service } = arrange();
      session.currentUser = { uid: 'ghost-uid', email: 'ghost@nowhere.com', name: 'Ghost', picture: '' };

      const restored = await service.restoreSession();

      expect(restored).toBeNull();
      expect(conn.items).toHaveLength(0);
      expect(await service.getLoggedUser()).toBeNull();
    });
  });
});
