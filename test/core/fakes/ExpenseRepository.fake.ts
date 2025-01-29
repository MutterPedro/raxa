import { ExpenseProps } from '../../../src/core/entities/Expense';
import { ExpenseRepository } from '../../../src/core/repositories/ExpenseRepository';
import { DBConnection } from '../../../src/infra/DBConnection';
import { MemoryDBConnection } from './DBConnection.fake';

export class ExpenseRepositoryFake extends ExpenseRepository {
  static build(dbConn?: DBConnection<ExpenseProps>): ExpenseRepositoryFake {
    return new ExpenseRepositoryFake(dbConn || new MemoryDBConnection<ExpenseProps>());
  }
}
