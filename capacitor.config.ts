import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.josephai.app',
  appName: 'Joseph AI',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
