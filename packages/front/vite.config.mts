// Plugins
import vue from '@vitejs/plugin-vue';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';
import webfontDownload from 'vite-plugin-webfont-dl';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

// Utilities
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve, dirname } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueI18nPlugin({
      include: resolve(
        dirname(fileURLToPath(import.meta.url)),
        './src/locales/*.json',
      ),
      strictMessage: false,
    }),
    viteCompression(),
    viteImagemin(),
    webfontDownload(),
    visualizer({
      filename: 'dist/bundle-stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.webp$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cover-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/beamanalytics\.b-cdn\.net\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: false, // Use existing manifest.json
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-core': ['vue', 'vue-router', 'pinia'],
          graphql: ['@urql/vue', 'graphql', 'graphql-ws'],
          vueuse: ['@vueuse/core', '@vueuse/motion'],
          i18n: ['vue-i18n'],
          icons: ['lucide-vue-next'],
        },
      },
    },
  },
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
      } as Record<string, unknown>,
      scss: {
        api: 'modern-compiler',
      } as Record<string, unknown>,
    },
  },
  server: {
    port: 4444,
  },
});
