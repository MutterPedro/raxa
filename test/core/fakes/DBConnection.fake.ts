/* eslint-disable @typescript-eslint/ban-ts-comment */
import { MaybeWithId, WithId } from '../../../src/@types/utils';
import { DBConnection } from '../../../src/infra/DBConnection';

export class MemoryDBConnection<T extends object> implements DBConnection<T> {
  public items: WithId<T>[] = [];
  private indexes: Map<number, number> = new Map();

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
      ...this.items[id - 1],
      ...data,
      id,
    };

    return 1;
  }

  async add(data: MaybeWithId<T>): Promise<WithId<T>> {
    const id = data.id || this.items.length + 1;
    this.items.push({ ...data, id });

    this.indexes.set(id, this.items.length - 1);

    return this.items[this.items.length - 1];
  }

  async getById(id: number): Promise<void | WithId<T>> {
    const idx = this.indexes.get(id);

    return idx !== undefined ? this.items[idx] : undefined;
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
