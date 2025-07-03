/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */

// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: true,  // 必须开启，允许其他主机访问
    port: 3000,
    strictPort: true,
    open: false,
    allowedHosts: [
      'all',            // 允许所有主机访问
      'codekids.local'  // 允许 codekids.local 访问
    ],
    hmr: {
      clientPort: 8080,
      host: 'localhost',
    },
    fs: {
      allow: ['.'],  // 允许访问本地文件
    }
  }
});


