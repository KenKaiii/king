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
      theme="dark"
      toastOptions={{
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          color: '#fff',
        },
      }}
    />
  </StrictMode>,
);
