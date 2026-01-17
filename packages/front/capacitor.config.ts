/// <reference types="@capacitor-community/safe-area" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'xyz.gutenku.app',
  appName: 'GutenKu',
  webDir: 'dist',
  plugins: {
    SafeArea: {
      statusBarStyle: 'LIGHT',
    },
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#2f5d62',
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT',
    },
  },
};

export default config;
