import Dexie, { Table } from 'dexie';

export interface DBConnection<T> {
  put(data: T): Promise<T>;
  add(data: T): Promise<T>;
  getById(id: string): Promise<T | void>;
}

export class IndexedDBConnection<T> implements DBConnection<T> {
  private table?: Table<T, string>;

  constructor(
    private readonly db: Dexie,
    tableName: string,
    fields: Array<keyof T> = [],
    version: number = 1,
  ) {
    this.db.version(version).stores({ [tableName]: fields.join(',') });
    this.table = this.db.table(tableName);
  }

  add(data: T): Promise<T> {
    if (!this.table) {
      return Promise.reject(new Error('Table not setup'));
    }

    return new Promise((resolve, reject) => {
      this.db.transaction('rw', this.table!, () => {
        this.table!.add(data)
          .then((id) => resolve({ ...data, id }))
          .catch(reject);
      });
    });
  }

  put(data: T): Promise<T> {
    if (!this.table) {
      return Promise.reject(new Error('Table not setup'));
    }

    return new Promise((resolve, reject) => {
      this.db.transaction('rw', this.table!, () => {
        this.table!.put(data)
          .then((id) => resolve({ ...data, id }))
          .catch(reject);
      });
    });
  }

  async getById(id: string): Promise<T | void> {
    if (!this.table) {
      return Promise.reject(new Error('Table not setup'));
    }

    return new Promise((resolve, reject) => {
      this.table!.get(id)
        .then((data) => resolve(data))
        .catch(reject);
    });
  }
}
