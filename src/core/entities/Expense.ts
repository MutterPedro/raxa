import { auto_increment_field, field, list_field, table } from '../utils/annotations';

export interface ExpenseProps {
  id: number;
  name: string;
  billId: number;
  participantIds: number[];
  payerId: number;
  amount: number;
  date: Date;
}

@table('expense')
export default class Expense {
  @auto_increment_field(1, 'id')
  id: number = 0;

  @field(1, 'name')
  name: string = '';

  @field(1, 'billId')
  billId: number = 0;

  @list_field(1, 'participantIds')
  participantIds: number[] = [];

  @field(1, 'payerId')
  payerId: number = 0;

  @field(1, 'amount')
  amount: number = 0;

  @field(1, 'date')
  date: Date = new Date();

  static build(): Expense {
    return new Expense();
  }
}
