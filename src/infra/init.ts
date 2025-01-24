import { IndexedDBConnection } from './DBConnection.ts';
import { applyMigrations } from './migrations';

import { dexieFactory } from '../inversify.config';

export function init(): void {
  const conn = dexieFactory();

  applyMigrations(conn);

  // infra test helpers
  window.createTable = createTable;
  window.doesDbExists = doesDbExists;
}

async function doesDbExists(dbName: string, version?: number): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    const request = window.indexedDB.open(dbName, version);

    request.onupgradeneeded = function (info) {
      if (info?.oldVersion === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
      request.transaction?.abort();
    };

    request.onerror = function () {
      reject(this.error);
    };

    request.onsuccess = function () {
      resolve(true);
      request.result.close();
    };
  });
}

function createTable<T extends object>(name: string, pageSize: number = 10): IndexedDBConnection<T> {
  const conn = dexieFactory();

  return new IndexedDBConnection<T>(conn, name, pageSize);
}
