import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'main',
          include: ['tests/main/**/*.test.ts'],
          environment: 'node',
        },
        resolve: {
          alias: {
            '@main': resolve(__dirname, 'src/main'),
          },
        },
      },
      {
        test: {
          name: 'renderer',
          include: ['tests/renderer/**/*.test.ts'],
          environment: 'node',
        },
        resolve: {
          alias: {
            '@/': resolve(__dirname, 'src/renderer/src') + '/',
          },
        },
      },
    ],
  },
});
