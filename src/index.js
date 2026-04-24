import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LanguageProvider } from './LanguageContext';

try {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('onix-theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
} catch (_) {
  /* ignore */
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
