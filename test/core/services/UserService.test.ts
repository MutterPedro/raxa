import casual from 'casual';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';
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
  });
});
