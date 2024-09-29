import { expect } from '@jest/globals';

import User, { UserProps } from '../../../src/core/entities/User';
import { UserRepository } from '../../../src/core/repositories/UserRepository';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';

describe('User.ts', function () {
  describe('Unit tests', function () {
    it('should be an entity #unit', function () {
      const user = new User();
      expect(user).toBeEntity();
    });

    it('should be saved respecting the fields defined at the migration #unit', async function () {
      const mockedDbConn = new MemoryDBConnection<UserProps>();
      const repo = new UserRepository(() => mockedDbConn);

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
  });
});
