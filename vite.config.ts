import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function cspPlugin(apiUrl: string): Plugin {
  let apiOrigin = '';
  try {
    apiOrigin = new URL(apiUrl).origin;
  } catch {
    apiOrigin = '';
  }

  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    // Recharts and inline style attributes require 'unsafe-inline' for styles (low risk).
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin}`.trim(),
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
  ].join('; ');

  return {
    name: 'inject-csp-meta',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: csp },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiUrl = env.VITE_API_URL ?? '';

  return {
    base: env.VITE_BASE_PATH ?? '/',
    plugins: [react(), cspPlugin(apiUrl)],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      port: 5173,
    },
  };
});
