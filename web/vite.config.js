import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serveSharedAssets = () => ({
  name: 'serve-shared-assets',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const match = req.url?.match(/^\/?(?:\.\.\/)?shared\/assets\/(.+)$/);
      if (match) {
        const relativeFilePath = match[1].split('?')[0];
        const fullPath = path.resolve(__dirname, '../shared/assets', relativeFilePath);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          const ext = path.extname(fullPath).toLowerCase();
          const mimeTypes = {
            '.webp': 'image/webp',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.woff2': 'font/woff2',
            '.woff': 'font/woff',
          };
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
          fs.createReadStream(fullPath).pipe(res);
          return;
        }
      }
      next();
    });
  },
});

export default defineConfig({
  envDir: path.resolve(__dirname, '../backend'),
  server: {
    fs: {
      allow: ['..'],
    },
  },
  plugins: [
    serveSharedAssets(),
    laravel({
      input: ['css/app.scss', 'js/app.ts'],
      publicDirectory: '../public',
      buildDirectory: 'build',
      refresh: [
        'views/**/*.blade.php',
        'src/**/*.php',
        'routes.php',
      ],
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'js'),
      '@shared/styles': path.resolve(__dirname, '../shared/styles'),
      '@shared/assets': path.resolve(__dirname, '../shared/assets'),
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
});
