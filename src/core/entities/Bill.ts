import { DBConnection, IndexedDBConnection } from '../../infra/DBConnection';
import BaseEntity from './BaseEntity';

export interface BillProps {
  name: string;
  amount: number;
  date: string;
  ownerId: number;
}

export default class Bill extends BaseEntity<BillProps> {
  name: string = '';
  amount: number = 0;
  date: Date = new Date();
  ownerId: number = 0;

  private constructor(db: DBConnection<BillProps>) {
    super(db);
  }

  toPlainObject(): BillProps {
    return {
      name: this.name,
      amount: this.amount,
      date: this.date.toISOString(),
      ownerId: this.ownerId,
    };
  }

  static build(): Bill {
    return new Bill(new IndexedDBConnection(window.conn, 'bill'));
  }

  static buildNullable(db: DBConnection<BillProps>): Bill {
    return new Bill(db);
  }
}
