import 'reflect-metadata';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import App from './App.tsx';
import './index.css';
import { init } from './infra/init.ts';
import { ServicesProvider } from './components/state/ServicesProvider.tsx';

init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServicesProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ServicesProvider>
  </React.StrictMode>,
);
