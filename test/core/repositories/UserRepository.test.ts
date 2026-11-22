import { expect } from '@jest/globals';

import casual from 'casual';
import User, { UserProps } from '../../../src/core/entities/User';
import { UserRepository } from '../../../src/core/repositories/UserRepository';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';
import { SessionManagerFake } from '../fakes/SessionManager.fake';

/**
 * The worlds the scenarios arrange on top of. Every factory clears the repository's
 * process-wide logged-in marker, so no test inherits a session from whoever ran
 * before it (the marker lives in a static, shared across instances).
 */
function arrange() {
  const conn = MemoryDBConnection.build<UserProps>();
  const session = SessionManagerFake.build();
  const repo = new UserRepository(conn, session);
  repo.clearLogged();

  return { conn, session, repo };
}

/** arrange: an unsaved user row with random defaults, overridable per test. */
function makeUser(overrides: Partial<User> = {}): User {
  return Object.assign(new User(), { name: casual.name, email: casual.email }, overrides);
}

describe('UserRepository.ts', function () {
  describe('Unit tests', function () {
    it('should be an entity #unit', function () {
      const user = new User();

      expect(user).toBeEntity();
    });

    it('should be saved respecting the fields defined at the migration #unit', async function () {
      const { conn, repo } = arrange();

      await repo.save(makeUser({ name: 'Josnei', email: 'josnei.silva@email.com' }));
      await repo.save(makeUser({ name: 'Jussara', email: 'jussara.silva@email.com' }));

      expect(conn.items[0].name).toBe('Josnei');
      expect(conn.items[0].email).toBe('josnei.silva@email.com');
      expect(conn.items[1].name).toBe('Jussara');
      expect(conn.items[1].email).toBe('jussara.silva@email.com');
    });

    it('should set a newly signed up user as logged in #unit', async function () {
      const { repo, session } = arrange();
      const user = makeUser({ id: 231 });
      const password = casual.password;

      await repo.setLoggedSignUp(user, password);

      expect(user.logged_in).toBe(true);
      expect(session.credentials).toHaveLength(1);
      expect(session.credentials).toContainEqual({ email: user.email, password });
    });

    it('should find a user by its firebase uid #unit', async function () {
      const { repo } = arrange();
      await repo.save(makeUser({ name: 'Ana', email: 'ana@email.com', firebase_uid: 'uid-ana' }));

      expect((await repo.findByUid('uid-ana'))?.email).toBe('ana@email.com');
      expect(await repo.findByUid('uid-inexistent')).toBeUndefined();
    });

    it('should hydrate legacy rows saved before the firebase uid field #unit', async function () {
      const { conn, repo } = arrange();

      // A v1 row has no firebase_uid (v2) or photo_url (v3) property at all.
      const saved = await repo.save(makeUser({ name: 'Legacy', email: 'legacy@email.com' }));
      delete conn.items[0].firebase_uid;
      delete conn.items[0].photo_url;

      const user = await repo.getById(saved.id);

      expect(user?.firebase_uid).toBe('');
      expect(user?.photo_url).toBe('');
    });

    it('should expose the account the session manager still has signed in #unit', async function () {
      const { repo, session } = arrange();
      session.currentUser = { uid: 'uid-ana', email: 'ana@email.com', name: 'Ana', picture: '' };

      expect(await repo.currentUser()).toEqual({ uid: 'uid-ana', email: 'ana@email.com', name: 'Ana', picture: '' });
    });

    it('should track the logged user until it is cleared #unit', async function () {
      const { conn, repo } = arrange();

      expect(await repo.getLogged()).toBeNull();

      const saved = await repo.save(makeUser({ name: 'Ana', email: 'ana@email.com' }));
      repo.setLogged(saved);

      expect((await repo.getLogged())?.id).toBe(saved.id);

      // A logged marker pointing at a deleted row resolves to nobody.
      await conn.delete(saved.id);
      expect(await repo.getLogged()).toBeNull();

      repo.clearLogged();
      expect(await repo.getLogged()).toBeNull();
    });
  });
});
