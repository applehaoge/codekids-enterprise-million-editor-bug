/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */

// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import MonacoEditorPlugin from 'vite-plugin-monaco-editor';
const MonacoEditor = (MonacoEditorPlugin as any)?.default ?? MonacoEditorPlugin;

export default defineConfig({
  plugins: [react(), tsconfigPaths(), MonacoEditor({ languageWorkers: ['editorWorkerService', 'typescript', 'json', 'css', 'html'] })],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: false,
    allowedHosts: ['all', 'codekids.local'],
    hmr: { protocol: 'ws', host: 'localhost', port: 5173 },
    fs: { allow: ['.'] },
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/ws/, '/api/ws')
      }
    }
  }
});


