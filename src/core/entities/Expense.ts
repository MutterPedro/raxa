import { auto_increment_field, field, list_field, table } from '../utils/decorators/database';

export interface ExpenseProps {
  name: string;
  billId: number;
  participantIds: number[];
  payerId: number;
  amount: number;
  date: string;
  /** When the row last matched the server; absent means local changes not yet synced. */
  synced_at?: number;
}

@table('expense')
export default class Expense {
  // Version 4 adds synced_at. Dexie *replaces* (never merges) the schema of a table
  // listed in a new version, so every field is re-declared under version 4.
  @auto_increment_field(1, 'id')
  @auto_increment_field(4, 'id')
  id: number = 0;

  @field(1, 'name')
  @field(4, 'name')
  name: string = '';

  @field(1, 'billId')
  @field(4, 'billId')
  billId: number = 0;

  @list_field(1, 'participantIds')
  @list_field(4, 'participantIds')
  participantIds: number[] = [];

  @field(1, 'payerId')
  @field(4, 'payerId')
  payerId: number = 0;

  @field(1, 'amount')
  @field(4, 'amount')
  amount: number = 0;

  @field(1, 'date')
  @field(4, 'date')
  date: Date = new Date();

  @field(4, 'synced_at')
  synced_at?: number;
}
