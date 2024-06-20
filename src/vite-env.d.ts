/// <reference types="vite/client" />

import Dexie from 'dexie';

declare global {
  interface Window {
    conn: Dexie;
    nullable_table: IndexedDBConnection<{ id: string; name: string }>;
    doesDbExists: (dbName: string, version: number = 10) => Promise<boolean>;
  }
}
