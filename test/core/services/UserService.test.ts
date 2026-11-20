import casual from 'casual';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';
import { SessionManagerFake } from '../fakes/SessionManager.fake';
import { UserProps } from '../../../src/core/entities';
import { UserRepositoryFake } from '../fakes/UserRepository.fake';
import { UserService } from '../../../src/core/services/UserService';

describe('UserService.ts', function () {
  describe('Unit tests', function () {
    it('should add a new user #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const fakeRepo = UserRepositoryFake.build(conn);
      const service = new UserService(fakeRepo);

      const name = casual.name;
      const email = casual.email;
      const user = await service.createUser({ name, email });

      expect(user).toBeDefined();
      expect(user.name).toBe(name);
      expect(user.email).toBe(email);
      expect(user.id).toBeGreaterThan(0);
      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].id).toBe(user.id);
    });

    it("should create the self user if it doesn't exist #unit", async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const fakeRepo = UserRepositoryFake.build(conn);
      const service = new UserService(fakeRepo);

      const user = await service.createSelf();
      expect(user).toBeDefined();
      expect(user.name).toBe('Eu');
      expect(conn.items[0].id).toBe(user.id);

      const user2 = await service.createSelf();
      expect(user2).toBeDefined();
      expect(user2.id).toBe(user.id);
      expect(conn.items).toHaveLength(1);
    });

    it('should list all the users #unit', async function () {
      const fakeRepo = UserRepositoryFake.build();
      const service = new UserService(fakeRepo);

      expect(await service.getUsers()).toHaveLength(0);

      const user1 = await service.createUser({ name: casual.name, email: casual.email });
      const user2 = await service.createUser({ name: casual.name, email: casual.email });
      const user3 = await service.createUser({ name: casual.name, email: casual.email });

      const users = await service.getUsers();
      expect(users).toHaveLength(3);
      expect(users.map((u) => u.id)).toContainEqual(user1.id);
      expect(users.map((u) => u.id)).toContainEqual(user2.id);
      expect(users.map((u) => u.id)).toContainEqual(user3.id);
    });

    it('should sign up the self user #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const fakeRepo = await UserRepositoryFake.buildPopulated(conn, 5);
      const service = new UserService(fakeRepo);

      const email = casual.email;
      const password = casual.password;
      const name = casual.name;
      const user = await service.signUp(email, password, name);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.name).toBe(name);
      expect(user.logged_in).toBe(true);
      expect(conn.items).toHaveLength(6);
      expect(conn.items[conn.items.length - 1].id).toBe(user.id);

      const self = await service.createSelf();
      expect(self).toStrictEqual(user);
    });

    it('should get users by their ids, skipping the missing ones #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const fakeRepo = UserRepositoryFake.build(conn);
      const service = new UserService(fakeRepo);

      const user1 = await service.createUser({ name: casual.name, email: casual.email });
      const user2 = await service.createUser({ name: casual.name, email: casual.email });

      const users = await service.getByIds([user1.id, 123456, user2.id]);
      expect(users).toHaveLength(2);
      expect(users.map((u) => u.id)).toEqual([user1.id, user2.id]);

      expect(await service.getByIds([])).toHaveLength(0);
    });

    it('should log an existing user in with a password #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);
      const user = await service.createUser({ name: casual.name, email: casual.email });

      const logged = await service.login(user.email, 'some-password');

      expect(logged.id).toBe(user.id);
      expect(logged.logged_in).toBe(true);
      expect(session.credentials).toEqual([{ email: user.email, password: 'some-password' }]);
      // The store is untouched — login only authenticates and marks the session.
      expect(conn.items).toHaveLength(1);
    });

    it('should claim the self row when a password login arrives without a local user #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);

      const user = await service.login('someone@newdevice.com', 'some-password');

      expect(user.id).toBe(1337);
      expect(user.email).toBe('someone@newdevice.com');
      expect(user.logged_in).toBe(true);
      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].email).toBe('someone@newdevice.com');
    });

    it('should leave local rows untouched when the password is wrong #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      session.loginError = { code: 'auth/wrong-password' };
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);
      const user = await service.createUser({ name: casual.name, email: casual.email });

      await expect(service.login(user.email, 'nope')).rejects.toEqual({ code: 'auth/wrong-password' });

      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].email).toBe(user.email);
    });

    it('should log in with Google reusing the user that has the email #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);
      const user = await service.createUser({ name: casual.name, email: 'ana@gmail.com' });
      session.googleCreds = { uid: 'ana-google-uid', email: 'ana@gmail.com', name: 'Ana' };

      const logged = await service.loginWithGoogle();

      expect(logged.id).toBe(user.id);
      expect(logged.logged_in).toBe(true);
      // The uid becomes the stable identity persisted on the row.
      expect(conn.items[0].firebase_uid).toBe('ana-google-uid');
    });

    it('should log in with Google creating the user when the email is new locally #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);
      session.googleCreds = { uid: 'novo-google-uid', email: 'novo@gmail.com', name: 'Novo Usuario' };

      const logged = await service.loginWithGoogle();

      expect(logged.name).toBe('Novo Usuario');
      expect(logged.email).toBe('novo@gmail.com');
      expect(logged.logged_in).toBe(true);
      expect(conn.items).toHaveLength(1);
      expect(conn.items[0].firebase_uid).toBe('novo-google-uid');
    });

    it('should reject when the Google popup fails #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      session.googleError = { code: 'auth/popup-closed-by-user' };
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);

      await expect(service.loginWithGoogle()).rejects.toEqual({ code: 'auth/popup-closed-by-user' });
      expect(conn.items).toHaveLength(0);
    });

    it('should prefer the row bound to the uid over the email match on google login #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);
      const bound = await service.createUser({ name: 'Binded', email: 'bound@old.email' });
      bound.firebase_uid = 'google-uid';
      await fakeRepo.save(bound);
      await service.createUser({ name: 'Email Match', email: 'google.user@example.com' });
      session.googleCreds = { uid: 'google-uid', email: 'google.user@example.com', name: 'Google User' };

      const logged = await service.loginWithGoogle();

      expect(logged.id).toBe(bound.id);
      expect(conn.items).toHaveLength(2);
    });

    it('should persist the firebase uid on sign up #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);

      const email = casual.email;
      const user = await service.signUp(email, 'some-password', casual.name);

      expect(user.firebase_uid).toBe(`uid-${email}`);
      expect(conn.items[conn.items.length - 1].firebase_uid).toBe(`uid-${email}`);
    });

    it('should persist the firebase uid on password login #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);
      const user = await service.createUser({ name: casual.name, email: casual.email });

      await service.login(user.email, 'some-password');

      expect(conn.items[0].firebase_uid).toBe(`uid-${user.email}`);
    });

    it('should return nobody as the logged user before any login #unit', async function () {
      const fakeRepo = UserRepositoryFake.build();
      fakeRepo.clearLogged();
      const service = new UserService(fakeRepo);

      expect(await service.getLoggedUser()).toBeNull();
    });

    it('should restore a live session by uid after a reload #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);
      const email = casual.email;
      const user = await service.createUser({ name: casual.name, email });
      await service.login(email, 'some-password');

      // Simulate a page reload: in-memory marker gone, Firebase session alive.
      fakeRepo.clearLogged();
      expect(await service.getLoggedUser()).toBeNull();
      session.currentUser = { uid: `uid-${email}`, email, name: user.name };

      const restored = await service.restoreSession();

      expect(restored?.id).toBe(user.id);
      expect((await service.getLoggedUser())?.id).toBe(user.id);
    });

    it('should clear the logged user when no firebase session survives #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);
      const user = await service.createUser({ name: casual.name, email: casual.email });
      await service.login(user.email, 'some-password');

      session.currentUser = null;
      const restored = await service.restoreSession();

      expect(restored).toBeNull();
      expect(await service.getLoggedUser()).toBeNull();
    });

    it('should adopt the email match and bind the uid when restoring #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);
      const user = await service.createUser({ name: 'Sem Uid', email: 'sem.uid@email.com' });

      // Row predates uid binding (created before this feature, or another device).
      session.currentUser = { uid: 'fresh-uid', email: 'sem.uid@email.com', name: 'Sem Uid' };

      const restored = await service.restoreSession();

      expect(restored?.id).toBe(user.id);
      expect(conn.items[0].firebase_uid).toBe('fresh-uid');
    });

    it('should not create a user when restoring an unknown account #unit', async function () {
      const conn = MemoryDBConnection.build<UserProps>();
      const session = SessionManagerFake.build();
      const fakeRepo = UserRepositoryFake.build(conn, session);
      const service = new UserService(fakeRepo);

      session.currentUser = { uid: 'ghost-uid', email: 'ghost@nowhere.com', name: 'Ghost' };

      expect(await service.restoreSession()).toBeNull();
      expect(conn.items).toHaveLength(0);
      expect(await service.getLoggedUser()).toBeNull();
    });
  });
});
