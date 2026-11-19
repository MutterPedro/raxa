/* eslint-disable @typescript-eslint/ban-ts-comment */
import { MaybeWithId, WithId } from '../../../src/@types/utils';
import type { DBConnection, ItemPredicate, ListOptions } from '../../../src/infra/DBConnection';

export class MemoryDBConnection<T extends object> implements DBConnection<T> {
  public items: WithId<T>[] = [];
  private indexes: Map<number, number> = new Map();
  // Auto-increment ids are never reused, mirroring Dexie: deleting the last row
  // must not hand its id to the next insert.
  private nextId = 1;
  // Mirrors IndexedDBConnection's default page size so unit tests exercise real paging.
  private pageSize = 10;

  private constructor() {}

  static build<T extends object>(pageSize = 10): MemoryDBConnection<T> {
    const conn = new MemoryDBConnection<T>();
    conn.pageSize = pageSize;
    return conn;
  }

  async update(id: number, data: Partial<T>): Promise<number> {
    const idx = this.indexes.get(id);
    if (idx === undefined) {
      return 0;
    }

    this.items[idx] = {
      ...this.items[idx],
      ...data,
      id,
    };

    return 1;
  }

  async add(data: MaybeWithId<T>): Promise<WithId<T>> {
    const id = data.id || this.nextId++;
    this.items.push({ ...data, id });

    if (id >= this.nextId) {
      this.nextId = id + 1;
    }

    this.indexes.set(id, this.items.length - 1);

    return this.items[this.items.length - 1];
  }

  async getById(id: number): Promise<void | WithId<T>> {
    const idx = this.indexes.get(id);

    return idx !== undefined ? this.items[idx] : undefined;
  }

  async delete(id: number): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
    this.indexes.clear();
    this.items.forEach((item, idx) => this.indexes.set(item.id, idx));
  }

  async list(page = 1, options?: ListOptions): Promise<WithId<T>[]> {
    return this.paginate(this.items, page, options);
  }

  async searchPage(predicate: ItemPredicate<T>, page = 1, options?: ListOptions): Promise<WithId<T>[]> {
    return this.paginate(
      this.items.filter((item) => predicate(item)),
      page,
      options,
    );
  }

  async count(predicate?: ItemPredicate<T>): Promise<number> {
    return predicate ? this.items.filter((item) => predicate(item)).length : this.items.length;
  }

  private paginate(items: WithId<T>[], page: number, options?: ListOptions): WithId<T>[] {
    if (page <= 0) {
      throw new RangeError('Page number must be greater than zero');
    }
    const ordered = options?.newestFirst ? [...items].reverse() : items;
    return ordered.slice((page - 1) * this.pageSize, page * this.pageSize);
  }

  async filter(filter: Partial<T>): Promise<WithId<T>[]> {
    return this.items.filter((item) => {
      //@ts-expect-error
      return Object.entries(filter).every(([key, value]) => item[key] === value);
    });
  }
}
