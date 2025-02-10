import { inject, injectable, tagged } from 'inversify';
import { BillProps } from '../entities';
import { BaseRepository } from './BaseRepository';
import { TYPES } from '../../infra/di';
import type { DBConnection } from '../../infra/DBConnection';
import Bill from '../entities/Bill';

@injectable()
export class BillRepository extends BaseRepository<Bill, BillProps> {
  @inject(TYPES.DBConnection)
  @tagged('entity', Bill.name)
  declare protected readonly dbConnection: DBConnection<BillProps>;

  fromPlainObject(data: BillProps): Bill {
    const bill = new Bill();

    bill.id = data.id;
    bill.name = data.name;
    bill.date = new Date(data.date);
    bill.ownerId = data.ownerId;

    return bill;
  }
}
