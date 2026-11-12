import Bill from '../../../src/core/entities/Bill';
import type Expense from '../../../src/core/entities/Expense';
import type User from '../../../src/core/entities/User';
import type { BillService } from '../../../src/core/services/BillService';

export interface BillServiceFakeOptions {
  bills?: Bill[];
  total?: number;
  participants?: User[];
  /** When true, getBills never resolves — for asserting loading states. */
  billsPending?: boolean;
  /** A single bill for getById (default: bill with id 1 'Show da Pizza'). */
  bill?: Bill | null;
  /** Expenses returned by getExpenses (default: empty). */
  expenses?: Expense[];
  /** Parts returned by getParticipantsParts (default: empty). */
  parts?: { amount: number; user: User }[];
}

// Component tests exercise a subset of BillService; the cast lets the fake stand in
// wherever the real service type is expected.
export function createBillServiceFake(options: BillServiceFakeOptions = {}): BillService {
  const {
    bills = [],
    total = 0,
    participants = [],
    billsPending = false,
    bill: defaultBill,
    expenses: defaultExpenses = [],
    parts: defaultParts = [],
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

  return {
    getBills: jest.fn(() => (billsPending ? new Promise<Bill[]>(() => {}) : Promise.resolve(bills))),
    getTotal: jest.fn(async () => total),
    getParticipants: jest.fn(async () => participants),
    getById: jest.fn(async () => defaultBillObj),
    getExpenses: jest.fn(async () => defaultExpenses),
    getParticipantsParts: jest.fn(async () => defaultParts),
  } as unknown as BillService;
}
