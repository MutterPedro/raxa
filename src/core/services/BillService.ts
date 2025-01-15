import { inject, injectable } from 'inversify';

import Bill from '../entities/Bill';
import { TYPES } from '../../infra/di';
import { BillRepository } from '../repositories/BillRepository';

@injectable()
export class BillService {
  constructor(@inject(TYPES.BillRepository) private readonly billRepo: BillRepository) {}

  async createBill(values: { name: string; amount: number; date?: Date; ownerId?: number }): Promise<Bill> {
    const bill = new Bill();
    bill.amount = values.amount;
    bill.name = values.name;
    bill.date = values.date || new Date();
    bill.ownerId = values.ownerId || 0;

    return this.billRepo.save(bill);
  }

  async getBills(page: number = 1): Promise<Bill[]> {
    // debugger;
    return this.billRepo.list(page);
  }
}
