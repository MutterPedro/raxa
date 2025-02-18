import { BillProps } from '../../../src/core/entities/Bill';
import { BillRepository } from '../../../src/core/repositories/BillRepository';
import { DBConnection } from '../../../src/infra/DBConnection';
import { MemoryDBConnection } from './DBConnection.fake';

export class BillRepositoryFake extends BillRepository {
  static build(dbConn?: DBConnection<BillProps>): BillRepositoryFake {
    return new BillRepositoryFake(dbConn || MemoryDBConnection.build<BillProps>());
  }
}
