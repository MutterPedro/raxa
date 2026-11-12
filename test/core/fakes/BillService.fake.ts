import type Bill from '../../../src/core/entities/Bill';
import type User from '../../../src/core/entities/User';
import type { BillService } from '../../../src/core/services/BillService';

export interface BillServiceFakeOptions {
  bills?: Bill[];
  total?: number;
  participants?: User[];
  /** When true, getBills never resolves — for asserting loading states. */
  billsPending?: boolean;
}

// Component tests exercise a subset of BillService; the cast lets the fake stand in
// wherever the real service type is expected.
export function createBillServiceFake(options: BillServiceFakeOptions = {}): BillService {
  const { bills = [], total = 0, participants = [], billsPending = false } = options;

  return {
    getBills: jest.fn(() => (billsPending ? new Promise<Bill[]>(() => {}) : Promise.resolve(bills))),
    getTotal: jest.fn(async () => total),
    getParticipants: jest.fn(async () => participants),
  } as unknown as BillService;
}
