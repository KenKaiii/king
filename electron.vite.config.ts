import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Inject the app version from package.json at build time so the renderer can
// display it without relying on an IPC round-trip (which can silently fail if
// the preload bundle is stale during dev).
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8')) as {
  version: string;
};
const appVersionDefine = {
  __APP_VERSION__: JSON.stringify(pkg.version),
};

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['@fal-ai/client', 'electron-updater', 'electron-log', 'electron-log/main'],
      },
    },
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
      },
    },
    define: appVersionDefine,
    plugins: [react(), tailwindcss()],
  },
});
