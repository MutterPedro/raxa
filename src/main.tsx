import React from 'react';
import ReactDOM from 'react-dom/client';
import Dexie from 'dexie';

import App from './App.tsx';
import './index.css';
import { IndexedDBConnection } from './infra/DBConnection.ts';

window.conn = new Dexie('raxa');
window.nullable_table = new IndexedDBConnection<{ id: string; name: string }>(window.conn, 'Test', ['id', 'name']);

window.doesDbExists = async function (dbName: string, version: number = 10): Promise<boolean> {
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
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
