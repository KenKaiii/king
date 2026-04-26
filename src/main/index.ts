import { app, BrowserWindow, protocol, net, session, shell } from 'electron';
import { join } from 'path';
import { pathToFileURL } from 'url';
import log from 'electron-log/main';
import { registerIpcHandlers } from './ipc';
import { resolveLocalFileUrl } from './services/paths';
import { loadApiKeysIntoEnv } from './services/apiKeyStore';
import { initUpdater, checkForUpdates } from './services/updater';
import { startAgentApiServer, stopAgentApiServer } from './services/agentApiServer';

// Must run before `app.ready`. Marks our custom `local-file://` scheme as a
// privileged origin so Chromium treats it as standard + secure (mandatory for
// fetch API support, stream responses, and for the renderer to load images
// without CORS / mixed-content noise). `bypassCSP:false` keeps our CSP rules
// applied to any resource loaded through it.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local-file',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: false,
    },
  },
]);

// Surface main-process crashes + promise rejections through electron-log so
// they land in the same log file as the updater + renderer errors. Without
// these handlers an uncaught rejection would print to stderr and disappear.
// Per Node docs: "It is not safe to resume normal operation after
// 'uncaughtException'." Installing a listener overrides Node's default crash
// behaviour, so we must exit ourselves — log first (electron-log's file
// transport is synchronous) then terminate with a non-zero code so the OS /
// supervisor knows the process died abnormally.
// https://nodejs.org/api/process.html#warning-using-uncaughtexception-correctly
process.on('uncaughtException', (err, origin) => {
  log.error('uncaughtException', err, 'origin:', origin);
  app.exit(1);
});
process.on('unhandledRejection', (reason) => {
  // Under the default --unhandled-rejections=throw mode these become fatal
  // anyway; explicit exit makes behaviour deterministic across Node versions.
  log.error('unhandledRejection', reason);
  app.exit(1);
});
app.on('render-process-gone', (_event, _wc, details) => {
  log.error('render-process-gone', details);
});
app.on('child-process-gone', (_event, details) => {
  log.error('child-process-gone', details);
});

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#fff8e0',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Sandbox ON: preload uses only `contextBridge` + `ipcRenderer`, both
      // sandbox-compatible. Do NOT add Node `require` in preload without
      // revisiting this flag.
      sandbox: true,
    },
  });

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Any `window.open` / target=_blank from the renderer is denied in-process
  // and, if https, handed off to the user's default browser. Never open a new
  // Electron window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Block all top-level navigations. The renderer is a single-page app — any
  // `will-navigate` to a non-current URL is either a bug or an attack vector.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const current = mainWindow?.webContents.getURL() ?? '';
    if (url !== current) event.preventDefault();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerLocalFileProtocol(): void {
  protocol.handle('local-file', async (request) => {
    const filePath = resolveLocalFileUrl(request.url);
    if (!filePath) {
      // Path-traversal attempt or malformed URL — refuse.
      console.warn('[local-file] forbidden URL', request.url);
      return new Response('Forbidden', { status: 403 });
    }
    try {
      return await net.fetch(pathToFileURL(filePath).toString());
    } catch (err) {
      // File is gone (deleted / never written / renamed) OR net.fetch
      // rejected for another reason. Log the underlying error so we can
      // diagnose 404s where the file looks like it should exist on disk
      // — then return a clean 404 so the renderer can show a broken-image
      // placeholder instead of spewing ERR_UNEXPECTED into the console.
      console.error(
        '[local-file] fetch failed',
        '\n  request.url:',
        request.url,
        '\n  filePath:',
        filePath,
        '\n  err:',
        err,
      );
      return new Response('Image not found', { status: 404 });
    }
  });
}

function setContentSecurityPolicy(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const isDev = !!process.env['ELECTRON_RENDERER_URL'];

    // In dev, Vite injects inline scripts for React Fast Refresh
    const scriptSrc = isDev ? "'self' 'unsafe-inline'" : "'self'";
    const connectSrc = isDev ? "'self' http://localhost:* ws://localhost:*" : "'self'";

    const workerSrc = isDev ? "'self' blob:" : "'self'";

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          [
            "default-src 'self'",
            `script-src ${scriptSrc}`,
            // 'unsafe-inline' is only necessary in dev — Vite / React-Refresh
            // inject runtime <style> tags. Production builds emit static
            // stylesheets via <link> so we can lock this down.
            `style-src 'self'${isDev ? " 'unsafe-inline'" : ''}`,
            // fal.media / fal.ai are fal.ai's image CDNs — we load their
            // URLs directly in the renderer for soft-refusal hash checks.
            `img-src 'self' data: blob: local-file: https://*.fal.media https://*.fal.ai`,
            `font-src 'self' data:`,
            `connect-src ${connectSrc}`,
            `worker-src ${workerSrc}`,
          ].join('; '),
        ],
      },
    });
  });
}

app.whenReady().then(() => {
  loadApiKeysIntoEnv();
  setContentSecurityPolicy();
  registerLocalFileProtocol();
  registerIpcHandlers();
  startAgentApiServer();
  initUpdater();
  createWindow();

  // Silent background check shortly after launch — the UI only surfaces a
  // notice if an update is actually available.
  setTimeout(() => {
    void checkForUpdates();
  }, 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

let agentApiStopping = false;
app.on('before-quit', (event) => {
  if (agentApiStopping) return;
  agentApiStopping = true;
  event.preventDefault();
  void stopAgentApiServer().finally(() => app.exit(0));
});
