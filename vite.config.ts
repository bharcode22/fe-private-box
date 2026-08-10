import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env variables automatically based on mode (development / production)
  const env = loadEnv(mode, process.cwd(), '');

  // Ambil URL Backend dari VITE_API_BASE_URL atau fallback ke http://127.0.0.1:5003
  const backendTarget = env.VITE_API_BASE_URL || env.BACKEND_URL || 'http://127.0.0.1:5003';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), './frontend/src'),
      },
    },
    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
