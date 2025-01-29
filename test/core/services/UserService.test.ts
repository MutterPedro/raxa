import casual from 'casual';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';
import { UserProps } from '../../../src/core/entities';
import { UserRepositoryFake } from '../fakes/UserRepository.fake';
import { UserService } from '../../../src/core/services/UserService';

describe('UserService.ts', function () {
  describe('Unit tests', function () {
    it('should add a new user #unit', async function () {
      const conn = new MemoryDBConnection<UserProps>();
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
      const conn = new MemoryDBConnection<UserProps>();
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
  });
});
