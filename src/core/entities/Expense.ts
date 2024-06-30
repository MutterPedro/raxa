import { DBConnection, IndexedDBConnection } from '../../infra/DBConnection';
import BaseEntity from './BaseEntity';

export interface ExpenseProps {
  name: string;
  billId: number;
  participantIds: number[];
  payerId: number;
  amount: number;
  date: string;
}

export default class Expense extends BaseEntity<ExpenseProps> {
  private constructor(db: DBConnection<ExpenseProps>) {
    super(db);
  }

  name: string = '';
  billId: number = 0;
  participantIds: number[] = [];
  payerId: number = 0;
  amount: number = 0;
  date: Date = new Date();

  protected toPlainObject(): ExpenseProps {
    return {
      name: this.name,
      billId: this.billId,
      participantIds: this.participantIds,
      payerId: this.payerId,
      amount: this.amount,
      date: this.date.toISOString(),
    };
  }

  static build(): Expense {
    return new Expense(new IndexedDBConnection(window.conn, 'expense'));
  }

  static buildNullable(db: DBConnection<ExpenseProps>): Expense {
    return new Expense(db);
  }
}
