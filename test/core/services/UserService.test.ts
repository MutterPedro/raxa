import casual from 'casual';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';
import { SessionManagerFake } from '../fakes/SessionManager.fake';
import { UserProps } from '../../../src/core/entities';
import { UserRepositoryFake } from '../fakes/UserRepository.fake';
import { UserService } from '../../../src/core/services/UserService';

/**
 * The worlds the scenarios arrange on top of. Every factory clears the repository's
 * process-wide logged-in marker, so no test inherits a session from whoever ran
 * before it (the marker lives in a static, shared across instances).
 */
function arrange() {
  const conn = MemoryDBConnection.build<UserProps>();
  const session = SessionManagerFake.build();
  const repo = UserRepositoryFake.build(conn, session);
  repo.clearLogged();
  const service = new UserService(repo);

  return { conn, session, repo, service };
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
      session.googleCreds = { uid: 'ana-google-uid', email: 'ana@gmail.com', name: 'Ana' };

      const logged = await service.loginWithGoogle();

      expect(logged.id).toBe(user.id);
      expect(logged.logged_in).toBe(true);
      // The uid becomes the stable identity persisted on the row.
      expect(conn.items[0].firebase_uid).toBe('ana-google-uid');
    });

    it('should log in with Google creating the user when the email is new locally #unit', async function () {
      const { conn, session, service } = arrange();
      session.googleCreds = { uid: 'novo-google-uid', email: 'novo@gmail.com', name: 'Novo Usuario' };

      const logged = await service.loginWithGoogle();

      expect(logged.name).toBe('Novo Usuario');
      expect(logged.email).toBe('novo@gmail.com');
      expect(logged.logged_in).toBe(true);
      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].firebase_uid).toBe('novo-google-uid');
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
      session.googleCreds = { uid: 'google-uid', email: 'google.user@example.com', name: 'Google User' };

      const logged = await service.loginWithGoogle();

      expect(logged.id).toBe(bound.id);
      expect(conn.items).toHaveLength(2);
    });

    it('should return nobody as the logged user before any login #unit', async function () {
      const { service } = arrange();

      expect(await service.getLoggedUser()).toBeNull();
    });

    it('should restore a live session by uid after a reload #unit', async function () {
      const email = casual.email;
      const { repo, session, service, user } = await arrangePasswordLoggedIn(email);

      // Simulate a page reload: the in-memory marker is gone, the Firebase
      // session is still alive and the row carries the bound uid.
      repo.clearLogged();
      session.currentUser = { uid: `uid-${email}`, email, name: user.name };

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
      session.currentUser = { uid: 'fresh-uid', email: 'sem.uid@email.com', name: 'Sem Uid' };

      const restored = await service.restoreSession();

      expect(restored?.id).toBe(user.id);
      expect(conn.items[0].firebase_uid).toBe('fresh-uid');
    });

    it('should not create a user when restoring an unknown account #unit', async function () {
      const { conn, session, service } = arrange();
      session.currentUser = { uid: 'ghost-uid', email: 'ghost@nowhere.com', name: 'Ghost' };

      const restored = await service.restoreSession();

      expect(restored).toBeNull();
      expect(conn.items).toHaveLength(0);
      expect(await service.getLoggedUser()).toBeNull();
    });
  });
});
