import BaseEntity from '../../../src/core/entities/BaseEntity';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';

interface TestEntityProps {
  name: string;
  age: number;
}
class TestEntity extends BaseEntity<TestEntityProps> {
  public name: string = '';
  public age: number = 0;

  protected toPlainObject(): TestEntityProps {
    return {
      name: this.name,
      age: this.age,
    };
  }
}

describe('BaseEntity.ts', function () {
  describe('Unit tests', function () {
    it('should be persist on the database when save() successfully #unit', async function () {
      const mockedDbConnection = new MemoryDBConnection<TestEntityProps>();
      const testEntity = new TestEntity(mockedDbConnection);
      testEntity.name = 'John';
      testEntity.age = 30;

      expect(testEntity).toBeInstanceOf(BaseEntity);

      const result = await testEntity.save();
      expect(result).toBe(true);
      expect(mockedDbConnection.items).toHaveLength(1);
      expect(mockedDbConnection.items[0].age).toBe(testEntity.age);
      expect(mockedDbConnection.items[0].name).toBe(testEntity.name);
      expect(testEntity.id).toBeDefined();
      expect(testEntity.id).toBeGreaterThan(0);

      const testEntity2 = new TestEntity(mockedDbConnection);
      testEntity2.name = 'Mary';
      testEntity2.age = 25;
      const result2 = await testEntity2.save();
      expect(result2).toBe(true);

      expect(mockedDbConnection.items).toHaveLength(2);
      expect(mockedDbConnection.items[testEntity2.id - 1].age).toBe(testEntity2.age);
      expect(mockedDbConnection.items[testEntity2.id - 1].name).toBe(testEntity2.name);
    });

    it('should be update the instance on the database when it already exists and save() successfully #unit', async function () {
      const mockedDbConnection = new MemoryDBConnection<TestEntityProps>();
      const testEntity = new TestEntity(mockedDbConnection);
      testEntity.name = 'John';
      testEntity.age = 30;

      let result = await testEntity.save();
      expect(result).toBe(true);

      testEntity.name = 'Albert';
      result = await testEntity.save();
      expect(result).toBe(true);

      expect(mockedDbConnection.items).toHaveLength(1);
      expect(mockedDbConnection.items[0].age).toBe(30);
      expect(mockedDbConnection.items[0].name).toBe('Albert');

      testEntity.age = 31;
      result = await testEntity.save();
      expect(result).toBe(true);
      expect(mockedDbConnection.items[0].age).toBe(31);
    });
  });
});
