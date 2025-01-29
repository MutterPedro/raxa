import Dexie from 'dexie';
import { Container, interfaces } from 'inversify';

import { DBConnection, IndexedDBConnection } from './infra/DBConnection';
import { TYPES } from './infra/di';
import { TABLE_NAME } from './core/utils/decorators';
import { BillRepository } from './core/repositories/BillRepository';
import { BillService } from './core/services/BillService';
import { ExpenseRepository } from './core/repositories/ExpenseRepository';
import { BillProps, ExpenseProps, UserProps } from './core/entities';
import User from './core/entities/User';
import Bill from './core/entities/Bill';
import Expense from './core/entities/Expense';
import { UserRepository } from './core/repositories/UserRepository';
import { UserService } from './core/services/UserService';

export const myContainer = new Container();

const db = new Dexie('raxa');
myContainer.bind<Dexie>(TYPES.Dexie).toConstantValue(db);

myContainer
  .bind<DBConnection<UserProps>>(TYPES.DBConnection)
  .toDynamicValue((context: interfaces.Context) => {
    const tableName = Reflect.getMetadata(TABLE_NAME, User);
    const db = context.container.get<Dexie>(TYPES.Dexie);
    return new IndexedDBConnection<UserProps>(db, tableName);
  })
  .inSingletonScope()
  .whenTargetTagged('entity', User.name);
myContainer
  .bind<DBConnection<BillProps>>(TYPES.DBConnection)
  .toDynamicValue((context: interfaces.Context) => {
    const tableName = Reflect.getMetadata(TABLE_NAME, Bill);
    const db = context.container.get<Dexie>(TYPES.Dexie);
    return new IndexedDBConnection<BillProps>(db, tableName);
  })
  .inSingletonScope()
  .whenTargetTagged('entity', Bill.name);
myContainer
  .bind<DBConnection<ExpenseProps>>(TYPES.DBConnection)
  .toDynamicValue((context: interfaces.Context) => {
    const tableName = Reflect.getMetadata(TABLE_NAME, Expense);
    const db = context.container.get<Dexie>(TYPES.Dexie);
    return new IndexedDBConnection<ExpenseProps>(db, tableName);
  })
  .inSingletonScope()
  .whenTargetTagged('entity', Expense.name);

myContainer.bind<BillRepository>(TYPES.BillRepository).to(BillRepository).inSingletonScope();
myContainer.bind<ExpenseRepository>(TYPES.ExpenseRepository).to(ExpenseRepository).inSingletonScope();
myContainer.bind<BillService>(TYPES.BillService).to(BillService).inSingletonScope();
myContainer.bind<UserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
myContainer.bind<UserService>(TYPES.UserService).to(UserService).inSingletonScope();

export function billServiceFactory() {
  return myContainer.get<BillService>(TYPES.BillService);
}

export function userServiceFactory() {
  return myContainer.get<UserService>(TYPES.UserService);
}

export function dexieFactory() {
  return myContainer.get<Dexie>(TYPES.Dexie);
}
