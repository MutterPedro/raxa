/* eslint-disable @typescript-eslint/ban-ts-comment */
import { MaybeWithId, WithId } from '../../../src/@types/utils';
import { DBConnection } from '../../../src/infra/DBConnection';

export class MemoryDBConnection<T extends object> implements DBConnection<T> {
  public items: WithId<T>[] = [];
  private indexes: Map<number, number> = new Map();
  // Auto-increment ids are never reused, mirroring Dexie: deleting the last row
  // must not hand its id to the next insert.
  private nextId = 1;

  private constructor() {}

  static build<T extends object>(): MemoryDBConnection<T> {
    return new MemoryDBConnection<T>();
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

  async list(): Promise<WithId<T>[]> {
    return this.items;
  }

  async filter(filter: Partial<T>): Promise<WithId<T>[]> {
    return this.items.filter((item) => {
      //@ts-expect-error
      return Object.entries(filter).every(([key, value]) => item[key] === value);
    });
  }
}
