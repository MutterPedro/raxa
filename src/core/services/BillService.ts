import { inject, injectable } from 'inversify';

import Bill from '../entities/Bill';
import { TYPES } from '../../infra/di';
import { BillRepository } from '../repositories/BillRepository';
import { ExpenseProps } from '../entities';
import Expense from '../entities/Expense';
import { ExpenseRepository } from '../repositories/ExpenseRepository';
import { WithId } from '../../@types/utils';
import User from '../entities/User';
import { buildNameMatcher } from '../utils/search';
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

  /**
   * One page of bills, newest first. `search` filters names ignoring case and
   * accents; blank/omitted terms list everything.
   */
  async getBills(page: number = 1, opts: { search?: string } = {}): Promise<Bill[]> {
    const term = opts.search?.trim();
    return term
      ? this.billRepo.searchPage(buildNameMatcher(term), page, { newestFirst: true })
      : this.billRepo.list(page, { newestFirst: true });
  }

  /** How many bills match the same filter — the feed decides "more pages" from this. */
  async countBills(opts: { search?: string } = {}): Promise<number> {
    const term = opts.search?.trim();
    return this.billRepo.count(term ? buildNameMatcher(term) : undefined);
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
   * and the bill's own name. The payer never joins the split by force: when they are
   * not one of the bill participants they paid on behalf of everyone and get credited.
   */
  async quickAddExpense(
    billId: number,
    values: { amount: number; name?: string; date?: Date; participantIds?: number[]; payerId?: number },
  ): Promise<Expense> {
    const date = values.date ?? new Date();
    const payerId = values.payerId ?? (await this.userService.createSelf()).id;

    const participants = values.participantIds ?? (await this.getParticipants(billId)).map((p) => p.id);
    // Someone has to carry the share: an empty split falls back to the payer alone.
    const participantIds = participants.length > 0 ? participants : [payerId];

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

  /** Partial update of a bill; returns null when the bill does not exist. */
  async updateBill(billId: number, values: { name?: string; date?: Date }): Promise<WithId<Bill> | null> {
    const bill = await this.billRepo.getById(billId);
    if (!bill) return null;

    if (values.name !== undefined) bill.name = values.name;
    if (values.date !== undefined) bill.date = values.date;

    return this.billRepo.save(bill);
  }

  /**
   * Partial update of an expense; returns null when the expense does not exist.
   * The payer does not have to be among the participants: paying from outside the
   * split is legitimate, and getParticipantsParts credits the full amount back to them.
   */
  async updateExpense(
    expenseId: number,
    values: { name?: string; amount?: number; date?: Date; participantIds?: number[]; payerId?: number },
  ): Promise<WithId<Expense> | null> {
    const expense = await this.expenseRepo.getById(expenseId);
    if (!expense) return null;

    if (values.name !== undefined) expense.name = values.name;
    if (values.amount !== undefined) expense.amount = values.amount;
    if (values.date !== undefined) expense.date = values.date;
    if (values.participantIds !== undefined) expense.participantIds = values.participantIds;
    if (values.payerId !== undefined) expense.payerId = values.payerId;

    return this.expenseRepo.save(expense);
  }

  /**
   * Everyone involved in the bill: the participants of its expenses plus whoever paid
   * for one of them — an outside payer must show up to receive the money back.
   */
  async getParticipants(billId: number): Promise<User[]> {
    const expenses = await this.getExpenses(billId);
    const participantsIds = new Set(expenses.flatMap((expense) => [...expense.participantIds, expense.payerId]));

    return this.userService.getByIds([...participantsIds]);
  }

  /**
   * Net balance per involved user: participants share each expense they take part in,
   * and whoever paid one has the full amount credited back. A payer outside the
   * participants shares in nothing and is simply owed the whole amount. Balances always
   * sum to zero.
   */
  async getParticipantsParts(billId: number): Promise<{ amount: number; user: User }[]> {
    const participants = await this.getParticipants(billId);
    const expenses = await this.getExpenses(billId);

    return participants.map((user) => {
      const amount = expenses.reduce((acc, expense) => {
        const shares = expense.participantIds.length;
        if (shares > 0 && expense.participantIds.includes(user.id)) acc += expense.amount / shares;
        if (expense.payerId === user.id) acc -= expense.amount;
        return acc;
      }, 0);

      return {
        amount,
        user,
      };
    });
  }
}
