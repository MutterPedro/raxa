/// <reference types="vite/client" />

import Dexie from 'dexie';
import { IndexedDBConnection } from './infra/DBConnection';
import type { ToastAction } from './components/common/Toast';

declare global {
  interface Window {
    conn: Dexie;
    doesDbExists(dbName: string, version: number = 10): Promise<boolean>;
    createTable<T extends object>(name: string, pageSize: number = 10): IndexedDBConnection<T>;
    getFirebaseSessionManager(): SessionManager;
    __seedVisualDemo?: () => Promise<number[]>;
    __notifyToast?: (message: string, options?: { duration?: number; action?: ToastAction }) => void;
  }
}
