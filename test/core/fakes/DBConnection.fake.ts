import { WithId } from '../../../src/@types/utils';
import { DBConnection } from '../../../src/infra/DBConnection';

export class MemoryDBConnection<T extends object> implements DBConnection {
  public items: WithId<T>[] = [];

  async update(id: number, data: Partial<T>): Promise<number> {
    this.items[id - 1] = {
      ...this.items[id - 1],
      ...data,
      id,
    };

    return 1;
  }

  async add(data: T): Promise<WithId<T>> {
    this.items.push({ ...data, id: this.items.length + 1 });
    return this.items[this.items.length - 1];
  }

  async getById(id: number): Promise<void | WithId<T>> {
    return { ...this.items[id - 1], id };
  }
}
