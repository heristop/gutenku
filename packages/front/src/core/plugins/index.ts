import { loadFonts } from './webfontloader';
import i18n from '@/locales';
import pinia from '@/store';
import type { App } from 'vue';

// Router is handled by ViteSSG in main.ts
export function registerPlugins(app: App) {
  loadFonts();

  app.use(i18n).use(pinia);
}
