import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host:'0.0.0.0',
    port: 5173,

    proxy: {
      /*
      |-------------------------
      | Versioned API (primary)
      |-------------------------
      */
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },

      /*
      |-------------------------
      | Legacy API (backward compatibility)
      |-------------------------
      */
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },

      /*
      |-------------------------
      | Sanctum (Laravel auth cookies)
      |-------------------------
      */
      '/sanctum': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});