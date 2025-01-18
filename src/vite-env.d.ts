/// <reference types="vite/client" />

import Dexie from 'dexie';
import { IndexedDBConnection } from './infra/DBConnection';

declare global {
  interface Window {
    conn: Dexie;
    doesDbExists(dbName: string, version: number = 10): Promise<boolean>;
    createTable<T extends object>(name: string, pageSize: number = 10, indexes: string[] = []): IndexedDBConnection<T>;
  }
}
