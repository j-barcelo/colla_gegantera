import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/app/',
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: process.env.VITE_API_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    vue(),
    legacy(),
    VitePWA({
      devOptions: {
        enabled: true,
      },
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.png'],
      manifest: {
        name: 'Colla Gegantera - Gestió',
        short_name: 'Colla',
        description: 'App de gestió interna per a colles geganteres',
        theme_color: '#ffffffff',
        background_color: '#00aae3',
        display: 'standalone',
        start_url: '/app/',
        scope: '/app/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: 'favicon.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      {
        find: /^@shared\/styles(\/index(\.scss)?)?$/,
        replacement: fileURLToPath(new URL('../shared/styles/index.scss', import.meta.url)),
      },
      { find: '@shared/assets', replacement: fileURLToPath(new URL('../shared/assets', import.meta.url)) },
      { find: '@shared', replacement: fileURLToPath(new URL('../shared/src', import.meta.url)) },
    ],
  },
  build: {
    outDir: '../public/app',
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.ts', '../shared/src/**/*.spec.ts'],
  },
});
