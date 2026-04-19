import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App';
import './globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      theme="light"
      toastOptions={{
        style: {
          background: '#fff8e0',
          border: '1px solid rgba(122, 68, 50, 0.35)',
          color: '#2a1912',
          fontFamily: 'Helveticaneue, "Helvetica Neue", Helvetica, Arial, sans-serif',
          borderRadius: '9999px',
          boxShadow: '0 8px 24px -8px rgba(51, 32, 26, 0.25)',
        },
      }}
    />
  </StrictMode>,
);
