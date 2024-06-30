import { WithId } from '../../../src/@types/utils';
import { DBConnection } from '../../../src/infra/DBConnection';

export class MemoryDBConnection<T> implements DBConnection<T> {
  public items: T[] = [];

  async update(id: number, data: Partial<T>): Promise<number> {
    this.items[id - 1] = {
      ...this.items[id - 1],
      ...data,
      id,
    };

    return 1;
  }

  async add(data: T): Promise<WithId<T>> {
    this.items.push(data);
    return {
      id: this.items.length,
      ...data,
    };
  }

  async getById(id: number): Promise<void | WithId<T>> {
    return { ...this.items[id - 1], id };
  }
}
