import { inject, injectable } from 'inversify';
import { BillProps } from '../entities';
import { BaseRepository } from './BaseRepository';
import { TYPES } from '../../infra/di';
import { DBConnection } from '../../infra/DBConnection';
import Bill from '../entities/Bill';

@injectable()
export class BillRepository extends BaseRepository<BillProps> {
  constructor(@inject(TYPES.DBConnection) factory: (clazz: object) => DBConnection) {
    super(factory(Bill));
  }
}
