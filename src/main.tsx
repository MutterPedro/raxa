import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import Bill from './core/entities/Bill.ts';
import { IndexedDBConnection } from './infra/DBConnection.ts';
import { NanoIDGenerator } from './infra/IDGenerator.ts';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
window.bill = new Bill(new IndexedDBConnection('BillDB'), new NanoIDGenerator());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
