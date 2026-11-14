import { inject, injectable } from 'inversify';

import Bill from '../entities/Bill';
import { TYPES } from '../../infra/di';
import { BillRepository } from '../repositories/BillRepository';
import { ExpenseProps } from '../entities';
import Expense from '../entities/Expense';
import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { WithId } from '../../@types/utils';
import User from '../entities/User';
import { UserService } from './UserService';

@injectable()
export class BillService {
  constructor(
    @inject(TYPES.BillRepository) private readonly billRepo: BillRepository,
    @inject(TYPES.ExpenseRepository) private readonly expenseRepo: ExpenseRepository,
    @inject(TYPES.UserService) private readonly userService: UserService,
  ) {}

  async createBill(values: { name: string; date?: Date; ownerId?: number }): Promise<Bill> {
    const bill = new Bill();
    bill.name = values.name;
    bill.date = values.date || new Date();
    bill.ownerId = values.ownerId || 0;

    return this.billRepo.save(bill);
  }

  async getBills(page: number = 1): Promise<Bill[]> {
    return this.billRepo.list(page);
  }

  async deleteBill(billId: number): Promise<void> {
    // The expenses go with the bill: orphans would skew the totals and divisions of
    // any bill that later reuses the id. They are deleted first so a failed cascade
    // leaves the bill around for a retry instead of silently orphaning them.
    const expenses = await this.expenseRepo.filter({ billId });
    await Promise.all(expenses.map((expense) => this.expenseRepo.delete(expense.id)));
    await this.billRepo.delete(billId);
  }

  async deleteExpense(expenseId: number): Promise<void> {
    await this.expenseRepo.delete(expenseId);
  }

  async addExpense(billId: number, expenseData: Omit<ExpenseProps, 'billId'>): Promise<Expense> {
    const expense = this.expenseRepo.fromPlainObject({ ...expenseData, billId, id: 0 });
    return this.expenseRepo.save(expense);
  }

  /**
   * Amount-first quick capture: only the amount is required, every other value falls
   * back to a default — today, the current self as payer, all current bill participants
   * and the bill's own name. The payer is always kept among the participants because
   * the division math only counts participants.
   */
  async quickAddExpense(
    billId: number,
    values: { amount: number; name?: string; date?: Date; participantIds?: number[]; payerId?: number },
  ): Promise<Expense> {
    const date = values.date ?? new Date();
    const payerId = values.payerId ?? (await this.userService.createSelf()).id;

    const participants =
      values.participantIds ?? (await this.getParticipants(billId)).map((participant) => participant.id);
    const participantIds = participants.includes(payerId) ? participants : [...participants, payerId];

    const bill = await this.getById(billId);
    const name = values.name?.trim() || bill?.name || '';

    return this.addExpense(billId, {
      name,
      amount: values.amount,
      date: date.toISOString(),
      participantIds,
      payerId,
    });
  }

  async getExpenses(billId: number): Promise<Expense[]> {
    const expenses = await this.expenseRepo.filter({ billId });
    return expenses;
  }

  async getTotal(billId: number): Promise<number> {
    const expenses = await this.getExpenses(billId);

    return expenses.reduce((acc, expense) => acc + expense.amount, 0);
  }

  async getById(billId: number): Promise<WithId<Bill> | null> {
    return this.billRepo.getById(billId);
  }

  async getParticipants(billId: number): Promise<User[]> {
    const expenses = await this.getExpenses(billId);
    const participantsIds = new Set(expenses.flatMap((expense) => expense.participantIds));

    return this.userService.getByIds([...participantsIds]);
  }

  async getParticipantsParts(billId: number): Promise<{ amount: number; user: User }[]> {
    const participants = await this.getParticipants(billId);
    const expenses = await this.getExpenses(billId);

    return participants.map((user) => {
      const amount = expenses.reduce((acc, expense) => {
        if (expense.participantIds.includes(user.id)) {
          const part = acc + expense.amount / expense.participantIds.length;

          if (expense.payerId === user.id) {
            return part - expense.amount;
          }

          return part;
        }
        return acc;
      }, 0);

      return {
        amount,
        user,
      };
    });
  }
}
