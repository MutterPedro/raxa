import { BaseRepository } from '../../../src/core/repositories/BaseRepository';
import { auto_increment_field, field, table } from '../../../src/core/utils/decorators';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';

interface TestEntityProps {
  id: number;
  name: string;
  age: number;
}

@table('test')
class TestEntity {
  @auto_increment_field(1, 'id')
  public id: number = 0;
  @field(1, 'name')
  public name: string = '';
  @field(1, 'age')
  public age: number = 0;
}

describe('BaseEntity.ts', function () {
  describe('Unit tests', function () {
    it('should be persist on the database when save() successfully #unit', async function () {
      const mockedDbConnection = new MemoryDBConnection<TestEntityProps>();
      const repo = new BaseRepository(mockedDbConnection);

      const testEntity = new TestEntity();
      testEntity.name = 'John';
      testEntity.age = 30;

      expect(repo).toBeInstanceOf(BaseRepository);

      const result = await repo.save(testEntity);
      expect(mockedDbConnection.items).toHaveLength(1);
      expect(mockedDbConnection.items[0].age).toBe(testEntity.age);
      expect(mockedDbConnection.items[0].name).toBe(testEntity.name);
      expect(mockedDbConnection.items[0].id).toBeGreaterThan(0);
      expect(result.id).toBe(mockedDbConnection.items[0].id);

      const testEntity2 = new TestEntity();
      testEntity2.name = 'Mary';
      testEntity2.age = 25;
      const result2 = await repo.save(testEntity2);

      expect(mockedDbConnection.items).toHaveLength(2);
      expect(mockedDbConnection.items[1].age).toBe(testEntity2.age);
      expect(mockedDbConnection.items[1].name).toBe(testEntity2.name);
      expect(result2.id).toBe(mockedDbConnection.items[1].id);
    });

    it('should be update the instance on the database when it already exists and save() successfully #unit', async function () {
      const mockedDbConnection = new MemoryDBConnection<TestEntityProps>();
      const repo = new BaseRepository(mockedDbConnection);

      const testEntity = new TestEntity();
      testEntity.name = 'John';
      testEntity.age = 30;

      let result = await repo.save(testEntity);
      expect(result.id).toBeGreaterThan(0);

      testEntity.id = result.id;
      testEntity.name = 'Albert';
      result = await repo.save(testEntity);

      expect(mockedDbConnection.items).toHaveLength(1);
      expect(mockedDbConnection.items[0].age).toBe(30);
      expect(mockedDbConnection.items[0].name).toBe('Albert');

      testEntity.age = 31;
      result = await repo.save(testEntity);
      expect(mockedDbConnection.items[0].age).toBe(31);
    });
  });
});
