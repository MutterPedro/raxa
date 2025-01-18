import Dexie from 'dexie';
import { Container, interfaces } from 'inversify';

import { DBConnection, IndexedDBConnection } from './infra/DBConnection';
import { TYPES } from './infra/di';
import { TABLE_NAME } from './core/utils/decorators';
import { BillRepository } from './core/repositories/BillRepository';
import { BillService } from './core/services/BillService';

const myContainer = new Container();

myContainer.bind<Dexie>(TYPES.Dexie).toConstantValue(new Dexie('raxa'));

myContainer
  .bind<interfaces.Factory<DBConnection>>(TYPES.DBConnection)
  .toFactory<DBConnection, [object]>((context: interfaces.Context) => {
    return (entityClass: object) => {
      const tableName = Reflect.getMetadata(TABLE_NAME, entityClass);
      return new IndexedDBConnection(context.container.get<Dexie>(TYPES.Dexie), tableName);
    };
  });

myContainer.bind<BillRepository>(TYPES.BillRepository).to(BillRepository);
myContainer.bind<BillService>(TYPES.BillService).to(BillService);

export function billServiceFactory() {
  return myContainer.get<BillService>(TYPES.BillService);
}

export function dexieFactory() {
  return myContainer.get<Dexie>(TYPES.Dexie);
}
