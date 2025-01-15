import { inject, injectable } from 'inversify';
import { BillProps } from '../entities';
import { BaseRepository } from './BaseRepository';
import { TYPES } from '../../infra/di';
import { DBConnection } from '../../infra/DBConnection';
import Bill from '../entities/Bill';

@injectable()
export class BillRepository extends BaseRepository<Bill, BillProps> {
  constructor(@inject(TYPES.DBConnection) factory: (clazz: object) => DBConnection<BillProps>) {
    super(factory(Bill));
  }

  fromPlainObject(data: BillProps): Bill {
    const bill = new Bill();

    bill.id = data.id;
    bill.name = data.name;
    bill.amount = data.amount;
    bill.date = new Date(data.date);
    bill.ownerId = data.ownerId;

    return bill;
  }
}
