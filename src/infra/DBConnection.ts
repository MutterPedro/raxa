import Dexie, { Table, UpdateSpec } from 'dexie';

import type { WithId } from '../@types/utils';
import { injectable } from 'inversify';

export interface DBConnection<T extends object = object> {
  update(id: number, data: object): Promise<number>;
  add(data: object): Promise<WithId<T>>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<WithId<T> | void>;
  list(page: number, options?: ListOptions): Promise<WithId<T>[]>;
  filter(filter: Partial<T>): Promise<WithId<T>[]>;
  /** Paged rows passing an arbitrary predicate, in the same order `list` uses. */
  searchPage(predicate: ItemPredicate<T>, page: number, options?: ListOptions): Promise<WithId<T>[]>;
  /** How many rows exist (optionally passing the predicate). */
  count(predicate?: ItemPredicate<T>): Promise<number>;
}

export interface ListOptions {
  /** Iterate newest id first instead of the storage order. */
  newestFirst?: boolean;
}

export type ItemPredicate<T extends object> = (item: WithId<T>) => boolean;

function assertPage(page: number): void {
  if (page <= 0) {
    throw new RangeError('Page number must be greater than zero');
  }
}

@injectable()
export class IndexedDBConnection<T extends object> implements DBConnection<T> {
  private table: Table<T, number>;

  constructor(
    private readonly db: Dexie,
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

  async delete(id: number): Promise<void> {
    await this.table.delete(id);
  }

  async getById(id: number): Promise<WithId<T> | void> {
    const entity = await this.table.get(id);

    return entity as WithId<T>;
  }

  async list(page: number = 1, options?: ListOptions): Promise<WithId<T>[]> {
    assertPage(page);
    const source = options?.newestFirst ? this.table.reverse() : this.table;
    const entities = await source
      .offset((page - 1) * this.pageSize)
      .limit(this.pageSize)
      .toArray();

    return entities as WithId<T>[];
  }

  filter(filter: Partial<T>): Promise<WithId<T>[]> {
    return this.table.where(filter).toArray() as Promise<WithId<T>[]>;
  }

  async searchPage(predicate: ItemPredicate<T>, page: number, options?: ListOptions): Promise<WithId<T>[]> {
    assertPage(page);
    let collection = this.table.filter((obj) => predicate(obj as WithId<T>));
    if (options?.newestFirst) {
      collection = collection.reverse();
    }
    return (await collection
      .offset((page - 1) * this.pageSize)
      .limit(this.pageSize)
      .toArray()) as WithId<T>[];
  }

  count(predicate?: ItemPredicate<T>): Promise<number> {
    return predicate ? this.table.filter((obj) => predicate(obj as WithId<T>)).count() : this.table.count();
  }
}
