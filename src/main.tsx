import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { IndexedDBConnection } from './infra/DBConnection.ts';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
window.conn = new IndexedDBConnection('raxa');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
