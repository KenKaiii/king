import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['@fal-ai/client'],
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
    plugins: [react(), tailwindcss()],
  },
});
