import Dexie, { Table } from 'dexie';

export interface DBConnection<T> {
  put(data: T): Promise<T>;
  add(data: T): Promise<T>;
  setUp(tableName: string, fieldsName: string[], version?: number): this;
}

export class IndexedDBConnection<T> implements DBConnection<T> {
  private readonly db: Dexie;
  private table?: Table<T, string>;

  constructor(private readonly dbName: string) {
    this.db = new Dexie(this.dbName);
  }

  setUp(tableName: string, fieldsName: string[], version: number = 1): this {
    this.db.version(version).stores({ [tableName]: fieldsName.join(',') });
    this.table = this.db.table(tableName);

    return this;
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
}
