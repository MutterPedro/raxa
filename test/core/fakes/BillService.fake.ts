import Bill from '../../../src/core/entities/Bill';
import Expense from '../../../src/core/entities/Expense';
import type User from '../../../src/core/entities/User';
import type { BillService } from '../../../src/core/services/BillService';

export interface BillServiceFakeOptions {
  /** Pool served by getBills, newest first, sliced per page; also the search corpus. */
  bills?: Bill[];
  /** Slice size getBills applies (small values make infinite-feed tests easy). */
  billsPageSize?: number;
  total?: number;
  participants?: User[];
  /** When true, getBills never resolves — for asserting loading states. */
  billsPending?: boolean;
  /** A single bill for getById (default: bill with id 1 'Show da Pizza'). */
  bill?: Bill | null;
  /** Expenses returned by getExpenses (default: empty). */
  expenses?: Expense[];
  /** Slice size getExpensesPage applies (small values make infinite-feed tests easy). */
  expensesPageSize?: number;
  /** Parts returned by getParticipantsParts (default: empty). */
  parts?: { amount: number; user: User }[];
  /** Id handed out by createBill (default: 1). */
  createdBillId?: number;
  /** Expense returned by addExpense (default: an empty expense). */
  createdExpense?: Expense;
  /** When true, addExpense rejects — for asserting bills survive expense failures. */
  addExpenseFails?: boolean;
  /** Expense returned by quickAddExpense (default: an empty expense). */
  quickAddedExpense?: Expense;
  /** When true, quickAddExpense rejects — for asserting the expense form survives failures. */
  quickAddExpenseFails?: boolean;
  /** When true, deleteExpense rejects — for asserting undo failures are reported. */
  deleteExpenseFails?: boolean;
  /** When true, deleteBill rejects — for asserting delete failures keep the user on the bill. */
  deleteBillFails?: boolean;
  /** When true, updateBill rejects — for asserting bill edit failures keep the form's user. */
  updateBillFails?: boolean;
  /** When true, updateExpense rejects — for asserting expense edit failures are reported. */
  updateExpenseFails?: boolean;
}

// Component tests exercise a subset of BillService; the cast lets the fake stand in
// wherever the real service type is expected.
export function createBillServiceFake(options: BillServiceFakeOptions = {}): BillService {
  const {
    bills = [],
    billsPageSize = 10,
    total = 0,
    participants = [],
    billsPending = false,
    bill: defaultBill,
    expenses: defaultExpenses = [],
    expensesPageSize = 10,
    parts: defaultParts = [],
    createdBillId = 1,
    createdExpense,
    addExpenseFails = false,
    quickAddedExpense,
    quickAddExpenseFails = false,
    deleteExpenseFails = false,
    deleteBillFails = false,
    updateBillFails = false,
    updateExpenseFails = false,
  } = options;

  const defaultBillObj =
    defaultBill ??
    (() => {
      const b = new Bill();
      b.id = 1;
      b.name = 'Show da Pizza';
      b.date = new Date(2026, 0, 15);
      b.ownerId = 1337;
      return b;
    })();

  // Mirrors BillService's listing contract: a newest-first pool, searched with a plain
  // case-insensitive contains (the real accent folding is unit-tested on the service),
  // and sliced per page.
  const searched = (search?: string): Bill[] => {
    const term = search?.trim().toLowerCase();
    return term ? bills.filter((bill) => bill.name.toLowerCase().includes(term)) : bills;
  };

  return {
    getBills: jest.fn(async (page: number = 1, opts: { search?: string } = {}) => {
      if (billsPending) return new Promise<Bill[]>(() => {});
      const found = searched(opts.search);
      return found.slice((page - 1) * billsPageSize, page * billsPageSize);
    }),
    countBills: jest.fn(async (opts: { search?: string } = {}) => Promise.resolve(searched(opts.search).length)),
    getTotal: jest.fn(async () => total),
    getParticipants: jest.fn(async () => participants),
    getById: jest.fn(async () => defaultBillObj),
    getExpenses: jest.fn(async () => defaultExpenses),
    getExpensesPage: jest.fn(async (_billId: number, page: number) =>
      defaultExpenses.slice((page - 1) * expensesPageSize, page * expensesPageSize),
    ),
    countExpenses: jest.fn(async () => defaultExpenses.length),
    getParticipantsParts: jest.fn(async () => defaultParts),
    createBill: jest.fn((values: { name: string; date?: Date; ownerId?: number }) => {
      const created = new Bill();
      created.id = createdBillId;
      created.name = values.name;
      created.date = values.date ?? new Date();
      created.ownerId = values.ownerId ?? 0;
      return Promise.resolve(created);
    }),
    addExpense: addExpenseFails
      ? jest.fn(() => Promise.reject(new Error('expense creation failed')))
      : jest.fn(async () => createdExpense ?? new Expense()),
    quickAddExpense: quickAddExpenseFails
      ? jest.fn(() => Promise.reject(new Error('quick add failed')))
      : jest.fn(async () => quickAddedExpense ?? new Expense()),
    deleteBill: deleteBillFails
      ? jest.fn(() => Promise.reject(new Error('delete failed')))
      : jest.fn(async () => undefined),
    deleteExpense: deleteExpenseFails
      ? jest.fn(() => Promise.reject(new Error('delete failed')))
      : jest.fn(async () => undefined),
    updateBill: updateBillFails
      ? jest.fn(() => Promise.reject(new Error('update failed')))
      : jest.fn(async (_id: number, values: { name?: string; date?: Date }) =>
          defaultBillObj ? { ...defaultBillObj, ...values } : null,
        ),
    updateExpense: updateExpenseFails
      ? jest.fn(() => Promise.reject(new Error('update failed')))
      : jest.fn(
          async (
            id: number,
            values: { name?: string; amount?: number; date?: Date; participantIds?: number[]; payerId?: number },
          ) => {
            const target = defaultExpenses.find((expense) => expense.id === id);
            return target ? { ...target, ...values } : null;
          },
        ),
  } as unknown as BillService;
}
