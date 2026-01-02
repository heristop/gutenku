import { loadFonts } from './webfontloader';
import i18n from '@/locales';
import pinia from '@/store';
import router from '@/router';
import type { App } from 'vue';

export function registerPlugins(app: App) {
  loadFonts();

  app.use(i18n).use(router).use(pinia);
}
