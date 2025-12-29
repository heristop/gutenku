// Plugins
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';
import webfontDownload from 'vite-plugin-webfont-dl';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// Utilities
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve, dirname } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    // Vue I18n plugin for pre-compiling locale messages
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
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-core': ['vue', 'vue-router', 'pinia'],
          vuetify: ['vuetify'],
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
