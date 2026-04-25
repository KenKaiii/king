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
  // electron-vite v5 auto-externalizes every `dependencies` entry from
  // package.json for the main + preload bundles, so we no longer need an
  // explicit `rollupOptions.external` list for @fal-ai/client, electron-updater,
  // or electron-log. If a specific package ever needs to be FORCED external
  // (e.g. a transitive binary dep), use `build.externalizeDeps.include` rather
  // than reintroducing `rollupOptions.external`.
  // https://electron-vite.org/guide/dependency-handling
  main: {},
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
