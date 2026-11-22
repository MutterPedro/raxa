import { expect } from '@jest/globals';

import User, { UserProps } from '../../../src/core/entities/User';
import { UserRepository } from '../../../src/core/repositories/UserRepository';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';
import { SessionManagerFake } from '../fakes/SessionManager.fake';
import casual from 'casual';

describe('User.ts', function () {
  describe('Unit tests', function () {
    it('should be an entity #unit', function () {
      const user = new User();
      expect(user).toBeEntity();
    });

    it('should be saved respecting the fields defined at the migration #unit', async function () {
      const mockedDbConn = MemoryDBConnection.build<UserProps>();
      const repo = new UserRepository(mockedDbConn, SessionManagerFake.build());

      const user = new User();
      user.name = 'Josnei';
      user.email = 'josnei.silva@email.com';

      await repo.save(user);
      expect(mockedDbConn.items[0].name).toBe(user.name);
      expect(mockedDbConn.items[0].email).toBe(user.email);

      const user2 = new User();
      user2.name = 'Jussara';
      user2.email = 'jussara.silva@email.com';

      await repo.save(user2);
      expect(mockedDbConn.items[1].name).toBe(user2.name);
      expect(mockedDbConn.items[1].email).toBe(user2.email);
    });

    it('should set a newly signed up user as logged in #unit', async function () {
      const mockedSessionManager = SessionManagerFake.build();
      const repo = new UserRepository(MemoryDBConnection.build<UserProps>(), mockedSessionManager);

      const user = new User();
      user.name = casual.name;
      user.email = casual.email;
      user.id = 231;
      const password = casual.password;

      await repo.setLoggedSignUp(user, password);
      expect(user.logged_in).toBe(true);
      expect(mockedSessionManager.credentials).toHaveLength(1);
      expect(mockedSessionManager.credentials).toContainEqual({ email: user.email, password });
    });

    it('should find a user by its firebase uid #unit', async function () {
      const mockedDbConn = MemoryDBConnection.build<UserProps>();
      const repo = new UserRepository(mockedDbConn, SessionManagerFake.build());

      const user = new User();
      user.name = 'Ana';
      user.email = 'ana@email.com';
      user.firebase_uid = 'uid-ana';
      await repo.save(user);

      expect((await repo.findByUid('uid-ana'))?.email).toBe('ana@email.com');
      expect(await repo.findByUid('uid-inexistent')).toBeUndefined();
    });

    it('should hydrate legacy rows saved before the firebase uid field #unit', async function () {
      const mockedDbConn = MemoryDBConnection.build<UserProps>();
      const repo = new UserRepository(mockedDbConn, SessionManagerFake.build());

      // A v1 row has no firebase_uid (v2) or photo_url (v3) property at all.
      const saved = await repo.save(Object.assign(new User(), { name: 'Legacy', email: 'legacy@email.com' }));
      delete mockedDbConn.items[0].firebase_uid;
      delete mockedDbConn.items[0].photo_url;

      const user = await repo.getById(saved.id);
      expect(user?.firebase_uid).toBe('');
      expect(user?.photo_url).toBe('');
    });

    it('should expose the account the session manager still has signed in #unit', async function () {
      const mockedSessionManager = SessionManagerFake.build();
      mockedSessionManager.currentUser = { uid: 'uid-ana', email: 'ana@email.com', name: 'Ana', picture: '' };
      const repo = new UserRepository(MemoryDBConnection.build<UserProps>(), mockedSessionManager);

      expect(await repo.currentUser()).toEqual({ uid: 'uid-ana', email: 'ana@email.com', name: 'Ana', picture: '' });
    });

    it('should track the logged user until it is cleared #unit', async function () {
      const mockedDbConn = MemoryDBConnection.build<UserProps>();
      const repo = new UserRepository(mockedDbConn, SessionManagerFake.build());
      repo.clearLogged();

      expect(await repo.getLogged()).toBeNull();

      const user = new User();
      user.name = 'Ana';
      user.email = 'ana@email.com';
      const saved = await repo.save(user);
      repo.setLogged(saved);

      expect((await repo.getLogged())?.id).toBe(saved.id);

      // A logged marker pointing at a deleted row resolves to nobody.
      await mockedDbConn.delete(saved.id);
      expect(await repo.getLogged()).toBeNull();

      repo.clearLogged();
      expect(await repo.getLogged()).toBeNull();
    });
  });
});
