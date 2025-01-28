import { inject, injectable } from 'inversify';

import Bill from '../entities/Bill';
import { TYPES } from '../../infra/di';
import { BillRepository } from '../repositories/BillRepository';
import { ExpenseProps } from '../entities';
import Expense from '../entities/Expense';
import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { WithId } from '../../@types/utils';

@injectable()
export class BillService {
  constructor(
    @inject(TYPES.BillRepository) private readonly billRepo: BillRepository,
    @inject(TYPES.ExpenseRepository) private readonly expenseRepo: ExpenseRepository,
  ) {}

  async createBill(values: { name: string; date?: Date; ownerId?: number }): Promise<Bill> {
    const bill = new Bill();
    bill.name = values.name;
    bill.date = values.date || new Date();
    bill.ownerId = values.ownerId || 0;

    return this.billRepo.save(bill);
  }

  async getBills(page: number = 1): Promise<Bill[]> {
    // debugger;
    return this.billRepo.list(page);
  }

  async addExpense(billId: number, expenseData: Omit<ExpenseProps, 'billId'>): Promise<Expense> {
    const expense = this.expenseRepo.fromPlainObject({ ...expenseData, billId, id: 0 });
    return this.expenseRepo.save(expense);
  }

  async getExpenses(billId: number): Promise<Expense[]> {
    const expenses = await this.expenseRepo.filter({ billId });
    return expenses;
  }

  async getTotal(billId: number): Promise<number> {
    const expenses = await this.expenseRepo.filter({ billId });

    return expenses.reduce((acc, expense) => acc + expense.amount, 0);
  }

  async getById(billId: number): Promise<WithId<Bill> | null> {
    return this.billRepo.getById(billId);
  }
}
