import Dexie, { Table, UpdateSpec } from 'dexie';

import type { WithId } from '../@types/utils';
import { inject, injectable } from 'inversify';
import { TYPES } from './di';

export interface DBConnection<T extends object = object> {
  update(id: number, data: object): Promise<number>;
  add(data: object): Promise<WithId<T>>;
  getById(id: number): Promise<WithId<T> | void>;
  list(page: number): Promise<WithId<T>[]>;
  filter(filter: Partial<T>): Promise<WithId<T>[]>;
}

@injectable()
export class IndexedDBConnection<T extends object> implements DBConnection<T> {
  private table: Table<T, number>;

  constructor(
    @inject(TYPES.Dexie) private readonly db: Dexie,
    tableName: string,
    private readonly pageSize: number = 10,
  ) {
    this.table = this.db.table(tableName);
  }

  async add(data: T): Promise<WithId<T>> {
    const id = await this.table.add(data);

    return { ...data, id };
  }

  async update(id: number, data: Partial<T>): Promise<number> {
    const rows = await this.table.update(id, data as UpdateSpec<T>);

    return rows;
  }

  async getById(id: number): Promise<WithId<T> | void> {
    const entity = await this.table.get(id);

    return entity as WithId<T>;
  }

  async list(page: number = 1): Promise<WithId<T>[]> {
    if (page <= 0) {
      throw new RangeError('Page number must be greater than zero');
    }
    const entities = await this.table
      .offset((page - 1) * this.pageSize)
      .limit(this.pageSize)
      .toArray();

    return entities as WithId<T>[];
  }

  filter(filter: Partial<T>): Promise<WithId<T>[]> {
    return this.table.where(filter).toArray() as Promise<WithId<T>[]>;
  }
}
