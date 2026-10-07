import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cat.colla.geganters',
  appName: 'Colla Gegantera',
  webDir: '../public/app',
  server: {
    androidScheme: 'https',
  },
};

export default config;
