import { auto_increment_field, field, table } from '../utils/decorators/database';

export interface BillProps {
  id: number;
  name: string;
  date: string;
  ownerId: number;
  /** When the row last matched the server; absent means local changes not yet synced. */
  synced_at?: number;
}

@table('bill')
export default class Bill {
  // Version 4 adds synced_at. Dexie *replaces* (never merges) the schema of a table
  // listed in a new version, so every field is re-declared under version 4.
  @auto_increment_field(1, 'id')
  @auto_increment_field(4, 'id')
  id: number = 0;

  @field(1, 'name')
  @field(4, 'name')
  name: string = '';

  @field(1, 'date')
  @field(4, 'date')
  date: Date = new Date();

  @field(1, 'ownerId')
  @field(4, 'ownerId')
  ownerId: number = 0;

  @field(4, 'synced_at')
  synced_at?: number;
}
