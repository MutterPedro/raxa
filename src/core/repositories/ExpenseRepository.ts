import { inject } from 'inversify';
import { ExpenseProps } from '../entities';
import { BaseRepository } from './BaseRepository';
import { TYPES } from '../../infra/di';
import { DBConnection } from '../../infra/DBConnection';
import Expense from '../entities/Expense';

export class ExpenseRepository extends BaseRepository<ExpenseProps> {
  constructor(@inject(TYPES.DBConnection) factory: (clazz: object) => DBConnection<ExpenseProps>) {
    super(factory(Expense));
  }
}
