import { Capacitor } from '@capacitor/core';

// SSR-safe: Capacitor APIs only exist in browser
export const isNative =
  typeof globalThis !== 'undefined' && Capacitor.isNativePlatform();
export const platform =
  typeof globalThis !== 'undefined' ? Capacitor.getPlatform() : 'web';

export const isIOS = platform === 'ios';
export const isAndroid = platform === 'android';
export const isWeb = platform === 'web';
