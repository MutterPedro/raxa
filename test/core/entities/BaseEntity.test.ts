import { word, string as casual_string } from 'casual';
import BaseEntity from '../../../src/core/entities/BaseEntity';
import { MemoryDBConnection } from '../fakes/DBConnection.fake';
import { FixedIDGenerator } from '../fakes/IDGenerator.fake';

class AClass extends BaseEntity<unknown> {
  public id: string = '';
  public foo: string = '';

  static build(): AClass {
    const instance = new AClass(new MemoryDBConnection(), new FixedIDGenerator(), word);
    instance.id = casual_string.replace(/ /g, '-');

    return instance;
  }

  toPlainObject(): unknown {
    return { id: this.id, foo: this.foo };
  }

  getDbConnection(): MemoryDBConnection {
    return this.db as MemoryDBConnection;
  }
}

describe('BaseEntity.ts', function () {
  describe('Sanity tests', function () {
    it('should exists #sanity', function () {
      expect(BaseEntity).toBeInstanceOf(Function);
    });
  });

  describe('Unit tests', function () {
    it("should create a new entity when don't exists yet #unit", async function () {
      const entity = AClass.build();
      expect(entity.getDbConnection().data).toHaveLength(0);

      await entity.save();
      expect(entity.getDbConnection().data).toHaveLength(1);
      expect(entity.getDbConnection().data[0].id).toEqual(entity.id);
    });

    it('should update an existing entity when exists #unit', async function () {
      const entity = AClass.build();
      await entity.save();

      expect(entity.getDbConnection().data).toHaveLength(1);

      entity.foo = 'bar';
      await entity.save();

      expect(entity.getDbConnection().data).toHaveLength(1);
      expect((entity.getDbConnection().data[0] as AClass).foo).toEqual(entity.foo);
      expect(entity.getDbConnection().data[0].id).toEqual(entity.id);
    });
  });
});
