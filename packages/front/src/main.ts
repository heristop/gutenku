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
import { isNative } from '@/utils/capacitor';

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
    }

    if (!import.meta.env.SSR && initialState.pinia) {
      pinia.state.value = initialState.pinia;
    }

    // Motion plugin
    if (isClient) {
      // Client: full motion support
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

      // Register service worker with auto-reload on update
      // SSR guard ensures Rollup completely tree-shakes this during SSR builds
      // (isClient alone isn't enough - Rollup still bundles the dynamic import)
      // Skip PWA registration in native Capacitor apps (they use native app stores)
      if (!import.meta.env.SSR && !isNative) {
        import('virtual:pwa-register').then(({ registerSW }) => {
          registerSW({
            immediate: true,
            onNeedRefresh() {
              globalThis.location.reload();
            },
            onOfflineReady() {
              console.log('App ready to work offline');
            },
            onRegisteredSW(swUrl, registration) {
              if (!registration) {
                return;
              }

              // Check for updates every 60 seconds (for iOS/Safari)
              // Safari doesn't aggressively check for SW updates in the background
              setInterval(async () => {
                // Skip if SW is currently installing
                if (registration.installing) {
                  return;
                }

                // Skip if offline
                if (!navigator.onLine) {
                  return;
                }

                // Skip if tab is not visible (background tab)
                if (document.visibilityState !== 'visible') {
                  return;
                }

                // Fetch SW to check availability before updating
                const resp = await fetch(swUrl, {
                  cache: 'no-store',
                  headers: { 'cache-control': 'no-cache' },
                });

                if (resp.status === 200) {
                  await registration.update();
                }
              }, 60 * 1000);
            },
          });
        });
      }
    }

    // SSR: register no-op directive to prevent errors
    if (!isClient) {
      app.directive('motion', {
        getSSRProps() {
          return {};
        },
      });
    }

    app.use(i18n);
    // Router is applied by ViteSSG
  },
);
