import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App';
import './globals.css';

// Route renderer errors through electron-log in main so they land in the same
// log file as IPC / updater / uncaughtException errors. Swallow IPC failures
// — we don't want a broken log channel to mask the underlying React error.
type WindowWithLog = Window & {
  api?: { log?: { error?: (level: string, message: string, stack?: string) => void } };
};
function logToMain(level: 'caught' | 'uncaught' | 'recoverable', error: unknown, info: unknown) {
  try {
    const e = error as Error;
    const stack =
      typeof (info as { componentStack?: string })?.componentStack === 'string'
        ? (info as { componentStack?: string }).componentStack
        : undefined;
    (window as WindowWithLog).api?.log?.error?.(
      level,
      e?.message ?? String(error),
      (e?.stack ?? '') + (stack ? '\n' + stack : ''),
    );
  } catch {
    /* ignore — error logging must never throw */
  }
}

createRoot(document.getElementById('root')!, {
  onCaughtError: (error, info) => {
    console.error('[caught]', error, info.componentStack);
    logToMain('caught', error, info);
  },
  onUncaughtError: (error, info) => {
    console.error('[uncaught]', error, info.componentStack);
    logToMain('uncaught', error, info);
  },
  onRecoverableError: (error, info) => {
    console.warn('[recoverable]', error, info.componentStack);
    logToMain('recoverable', error, info);
  },
}).render(
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
