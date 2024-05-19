import { DBConnection } from '../../infra/DBConnection';
import { IDGenerator } from '../../infra/IDGenerator';
import BaseEntity from './BaseEntity';

interface IBill {
  id: string;
  name: string;
  amount: number;
  date: Date;
}

export default class Bill extends BaseEntity<IBill> {
  constructor(
    protected readonly db: DBConnection<IBill>,
    protected readonly idGenerator: IDGenerator,
  ) {
    super(db, idGenerator, 'bill', ['name', 'amount', 'date', 'owner']);
  }

  toPlainObject(): IBill {
    return {
      id: 'my-super-complex-id-3',
      name: 'test',
      amount: 100,
      date: new Date(),
    };
  }
}
