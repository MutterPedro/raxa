import 'reflect-metadata';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import './index.css';
import { init } from './infra/init.ts';
import { BillServiceProvider } from './components/state/BillServiceContext.tsx';

init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BillServiceProvider>
      <App />
    </BillServiceProvider>
  </React.StrictMode>,
);
