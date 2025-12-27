/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import { loadFonts } from './webfontloader';
import vuetify from './vuetify';
import i18n from '@/locales';
import pinia from '@/store';
import router from '@/router';

// Types
import type { App } from 'vue';

export function registerPlugins(app: App) {
  loadFonts();

  // Register i18n before router (in case router guards need translations)
  app.use(vuetify).use(i18n).use(router).use(pinia);
}
