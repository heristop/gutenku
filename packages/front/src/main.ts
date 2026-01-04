import '@/assets/css/main.scss';
import App from './App.vue';
import { ViteSSG } from 'vite-ssg';
import urql from '@urql/vue';
import { urqlClient } from './client';
import { MotionPlugin } from '@vueuse/motion';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import i18n from '@/locales';
import { routes } from '@/router';
import { loadFonts } from '@/core/plugins/webfontloader';

export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
  },
  ({ app, isClient, initialState }) => {
    // GraphQL - client only (requires network)
    if (isClient) {
      app.use(urql, urqlClient);
    }

    // Pinia with SSG state serialization
    const pinia = createPinia();
    if (isClient) {
      pinia.use(piniaPluginPersistedstate);
    }
    app.use(pinia);

    // Serialize/restore Pinia state for SSG
    if (import.meta.env.SSR) {
      initialState.pinia = pinia.state.value;
    } else if (initialState.pinia) {
      pinia.state.value = initialState.pinia;
    }

    // Motion plugin - client only (requires DOM)
    if (isClient) {
      app.use(MotionPlugin, {
        directives: {
          'zen-fade': {
            initial: { opacity: 0, y: 20 },
            enter: {
              opacity: 1,
              y: 0,
              transition: { duration: 400, ease: [0.25, 0.8, 0.25, 1] },
            },
          },
          'zen-scale': {
            initial: { opacity: 0, scale: 0.9 },
            enter: {
              opacity: 1,
              scale: 1,
              transition: { duration: 400, ease: [0.25, 0.8, 0.25, 1] },
            },
          },
          'zen-slide': {
            initial: { opacity: 0, x: -20 },
            enter: {
              opacity: 1,
              x: 0,
              transition: { duration: 300, ease: 'easeOut' },
            },
          },
        },
      });

      // Load fonts on client
      loadFonts();
    }

    app.use(i18n);
    // Router is applied by ViteSSG
  },
);
