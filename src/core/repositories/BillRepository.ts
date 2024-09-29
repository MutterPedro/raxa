import { inject } from 'inversify';
import { BillProps } from '../entities';
import { BaseRepository } from './BaseRepository';
import { TYPES } from '../../infra/types';
import { DBConnection } from '../../infra/DBConnection';
import Bill from '../entities/Bill';

export class BillRepository extends BaseRepository<BillProps> {
  constructor(@inject(TYPES.DBConnection) factory: (clazz: object) => DBConnection) {
    super(factory(Bill));
  }
}
