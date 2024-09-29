import { Container, interfaces } from 'inversify';
import { DBConnection, IndexedDBConnection } from './infra/DBConnection';
import { TYPES } from './infra/di';
import Dexie from 'dexie';
import { TABLE_NAME } from './core/utils/decorators';
import { BillRepository } from './core/repositories/BillRepository';

const myContainer = new Container();

myContainer.bind<Dexie>(TYPES.Dexie).toConstantValue(new Dexie('raxa'));

myContainer
  .bind<interfaces.Factory<DBConnection>>(TYPES.DBConnection)
  .toFactory<DBConnection, [object]>((context: interfaces.Context) => {
    return (entityClass: object) => {
      const tableName = Reflect.getMetadata(TABLE_NAME, entityClass.constructor);
      return new IndexedDBConnection(context.container.get<Dexie>(TYPES.Dexie), tableName);
    };
  });

myContainer.bind<BillRepository>(TYPES.BillRepository).to(BillRepository);

export { myContainer };
