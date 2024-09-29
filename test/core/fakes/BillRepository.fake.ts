import Bill from '../../../src/core/entities/Bill';
import { BillRepository } from '../../../src/core/repositories/BillRepository';
import { DBConnection } from '../../../src/infra/DBConnection';
import { MemoryDBConnection } from './DBConnection.fake';

export class BillRepositoryFake extends BillRepository {
  public readonly data: Bill[] = [];

  static build(dbConn?: DBConnection): BillRepositoryFake {
    return new BillRepositoryFake(() => dbConn || new MemoryDBConnection());
  }

  save(bill: Bill): Promise<Bill> {
    const billWithId = {
      ...bill,
      id: this.data.length + 1,
    };
    this.data.push(billWithId);
    return Promise.resolve(billWithId);
  }
}
