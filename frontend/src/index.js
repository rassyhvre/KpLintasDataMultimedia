import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LogoProvider } from './context/LogoContext';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LogoProvider>
        <App />
      </LogoProvider>
    </BrowserRouter>
  </React.StrictMode>
);
