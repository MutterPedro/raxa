import BaseEntity from '../../../src/core/entities/BaseEntity';
import User, { UserProps } from '../../../src/core/entities/User';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';

describe('User.ts', function () {
  describe('Unit tests', function () {
    it('should be an entity #unit', function () {
      const mockedDbConn = new MemoryDBConnection<UserProps>();

      const user = User.buildNullable(mockedDbConn);

      expect(user).toBeInstanceOf(BaseEntity);
    });

    it('should be saved respecting the fields defined at the migration #unit', async function () {
      const mockedDbConn = new MemoryDBConnection<UserProps>();

      const user = User.buildNullable(mockedDbConn);
      user.name = 'Josnei';
      user.email = 'josnei.silva@email.com';

      await user.save();
      expect(mockedDbConn.items[0].name).toBe(user.name);
      expect(mockedDbConn.items[0].email).toBe(user.email);

      const user2 = User.buildNullable(mockedDbConn);
      user2.name = 'Jussara';
      user2.email = 'jussara.silva@email.com';

      await user2.save();
      expect(mockedDbConn.items[1].name).toBe(user2.name);
      expect(mockedDbConn.items[1].email).toBe(user2.email);
    });
  });
});
