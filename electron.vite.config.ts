import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@core': path.resolve(__dirname, './core'),
      },
    },
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, 'electron/main.ts'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, 'electron/preload.ts'),
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs',
        },
      },
    },
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@core': path.resolve(__dirname, './core'),
      },
    },
    root: '.',
    build: {
      rollupOptions: {
        input: { index: path.resolve(__dirname, 'index.html') },
      },
    },
    server: {
      port: 3000,
    },
  },
});
