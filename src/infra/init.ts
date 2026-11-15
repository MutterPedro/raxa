import { IndexedDBConnection } from './DBConnection.ts';
import { applyMigrations } from './migrations';

import { dexieFactory, userServiceFactory, billServiceFactory } from '../inversify.config';
import { FirebaseSessionManager, SessionManager } from './SessionManager.ts';

export function init(): void {
  const conn = dexieFactory();

  applyMigrations(conn);

  const userService = userServiceFactory();
  userService.createSelf().catch(console.error);

  // infra test helpers
  window.createTable = createTable;
  window.doesDbExists = doesDbExists;
  window.getFirebaseSessionManager = getFirebaseSessionManager;

  if (import.meta.env.DEV) {
    window.__seedVisualDemo = seedVisualDemo;
  }
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

function getFirebaseSessionManager(): SessionManager {
  return new FirebaseSessionManager();
}

async function seedVisualDemo(): Promise<number[]> {
  const userService = userServiceFactory();
  const billService = billServiceFactory();

  const self = await userService.createSelf();
  const ana = await userService.createUser({ name: 'Ana', email: 'ana@example.com' });
  const beto = await userService.createUser({ name: 'Beto', email: 'beto@example.com' });

  const fixedDate = new Date('2026-01-15T12:00:00');
  const bill1 = await billService.createBill({ name: 'Show da Pizza', date: fixedDate });
  const bill2 = await billService.createBill({ name: 'Churrasco de domingo', date: fixedDate });

  await billService.addExpense(bill1.id, {
    name: 'Ingressos',
    amount: 120.5,
    payerId: self.id,
    participantIds: [self.id, ana.id],
    date: fixedDate.toISOString(),
  });
  await billService.addExpense(bill1.id, {
    name: 'Transporte',
    amount: 30,
    payerId: ana.id,
    participantIds: [self.id, ana.id, beto.id],
    date: fixedDate.toISOString(),
  });

  return [bill1.id, bill2.id];
}
