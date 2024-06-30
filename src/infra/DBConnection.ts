import Dexie, { Table, UpdateSpec } from 'dexie';
import type { WithId } from '../@types/utils';

export interface DBConnection<T> {
  update(id: number, data: Partial<T>): Promise<number>;
  add(data: T): Promise<T>;
  getById(id: number): Promise<T | void>;
}

export class IndexedDBConnection<T extends object> implements DBConnection<T> {
  private table?: Table<T, number>;

  constructor(
    private readonly db: Dexie,
    tableName: string,
  ) {
    this.table = this.db.table(tableName);
  }

  async add(data: T): Promise<WithId<T>> {
    if (!this.table) {
      throw new Error('Table not setup');
    }

    const id = await this.table!.add(data);

    return { ...data, id };
  }

  async update(id: number, data: Partial<T>): Promise<number> {
    if (!this.table) {
      throw new Error('Table not setup');
    }

    const rows = await this.table!.update(id, data as UpdateSpec<T>);

    return rows;
  }

  async getById(id: number): Promise<WithId<T> | void> {
    if (!this.table) {
      throw new Error('Table not setup');
    }

    const entity = await this.table!.get(id);

    return entity as WithId<T>;
  }
}
