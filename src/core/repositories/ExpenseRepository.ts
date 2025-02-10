import { inject, tagged } from 'inversify';

import { ExpenseProps } from '../entities';
import { BaseRepository } from './BaseRepository';
import { TYPES } from '../../infra/di';
import type { DBConnection } from '../../infra/DBConnection';
import Expense from '../entities/Expense';
import { WithId } from '../../@types/utils';

export class ExpenseRepository extends BaseRepository<Expense, ExpenseProps> {
  @inject(TYPES.DBConnection)
  @tagged('entity', Expense.name)
  declare protected readonly dbConnection: DBConnection<ExpenseProps>;

  fromPlainObject(data: WithId<ExpenseProps>): WithId<Expense> {
    const expense = new Expense();
    expense.id = data.id;
    expense.name = data.name;
    expense.billId = data.billId;
    expense.participantIds = data.participantIds;
    expense.payerId = data.payerId;
    expense.amount = data.amount;
    expense.date = new Date(data.date);

    return expense;
  }
}
