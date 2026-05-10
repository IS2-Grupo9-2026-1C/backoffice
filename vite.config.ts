import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, new URL('.', import.meta.url).pathname, '');

  return {
    base: env.VITE_BASE_PATH ?? '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    server: {
      port: 5173,
    },
  };
});
