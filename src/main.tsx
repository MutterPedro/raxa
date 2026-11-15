import 'reflect-metadata';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import App from './App.tsx';
import './index.css';
import { init } from './infra/init.ts';
import { ServicesProvider } from './components/state/ServicesProvider.tsx';
import { ToastProvider } from './components/common/Toast.tsx';

init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServicesProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </ServicesProvider>
  </React.StrictMode>,
);
