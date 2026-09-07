import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const sanitizeBaseUrl = (url) => {
  if (!url || typeof url !== 'string' || url.includes('/editor/preview') || url.includes('/apps/')) {
    return 'https://base44.app';
  }
  return url.replace(/\/$/, '');
};

// Ensure environment variables are valid backend URLs and IDs
process.env.VITE_BASE44_APP_BASE_URL = sanitizeBaseUrl(process.env.VITE_BASE44_APP_BASE_URL);
if (!process.env.VITE_BASE44_APP_ID || process.env.VITE_BASE44_APP_ID === 'null') {
  process.env.VITE_BASE44_APP_ID = '6a8536b631a67708e1537e3c';
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = sanitizeBaseUrl(env.VITE_BASE44_APP_BASE_URL);

  return {
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: 'all',
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    plugins: [
      base44({
        // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
        // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
        legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
        hmrNotifier: true,
        navigationNotifier: true,
        analyticsTracker: true,
        visualEditAgent: true
      }),
      react(),
    ]
  };
});
