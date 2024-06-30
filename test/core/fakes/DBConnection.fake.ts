import { word } from 'casual';
import { DBConnection } from '../../../src/infra/DBConnection';

export class MemoryDBConnection<T extends { id: string } = { id: string }> implements DBConnection<T> {
  public data: T[] = [];
  public tableName: string = '';
  public fieldsName: string[] = [];
  public version?: number = 1;

  constructor(data: T[] = []) {
    this.data = data;
    this.tableName = word;
  }

  getById(id: string): Promise<void | T> {
    return Promise.resolve(this.data.find((d) => d.id === id));
  }

  async update(data: T): Promise<T> {
    const idx = this.data.findIndex((d) => d.id === data.id);

    if (idx === -1) {
      throw new Error('Not found');
    }

    this.data[idx] = { ...this.data[idx], ...data };

    return data;
  }

  async add(data: T): Promise<T> {
    this.data.push(data);

    return data;
  }

  setUp(tableName: string, version?: number): this {
    this.tableName = tableName;
    this.version = version;

    return this;
  }
}
