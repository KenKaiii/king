import { app, BrowserWindow, protocol, net, session } from 'electron';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { registerIpcHandlers } from './ipc';
import { getImagesDir } from './services/paths';
import { loadApiKeysIntoEnv } from './services/apiKeyStore';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0a0a0a',
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
  protocol.handle('local-file', (request) => {
    const url = new URL(request.url);
    const filePath = join(getImagesDir(), decodeURIComponent(url.pathname));
    return net.fetch(pathToFileURL(filePath).toString());
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
            `img-src 'self' data: blob: local-file:`,
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
  createWindow();

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
