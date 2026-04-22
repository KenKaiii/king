import { app, BrowserWindow, protocol, net, session } from 'electron';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { registerIpcHandlers } from './ipc';
import { getImagesDir } from './services/paths';
import { loadApiKeysIntoEnv } from './services/apiKeyStore';
import { initUpdater, checkForUpdates } from './services/updater';

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
      sandbox: false,
    },
  });

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerLocalFileProtocol(): void {
  protocol.handle('local-file', async (request) => {
    const url = new URL(request.url);
    const filePath = join(getImagesDir(), decodeURIComponent(url.pathname));
    try {
      return await net.fetch(pathToFileURL(filePath).toString());
    } catch {
      // File is gone (deleted / never written / renamed). Return a clean
      // 404 so the renderer can show a broken-image placeholder instead
      // of spewing ERR_UNEXPECTED into the console.
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
            `style-src 'self' 'unsafe-inline'`,
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
