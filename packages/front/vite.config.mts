// Plugins
import vue from '@vitejs/plugin-vue';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';
import webfontDownload from 'vite-plugin-webfont-dl';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

// Utilities
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';

const env = loadEnv('', process.cwd(), ['GUTENGUESS_', 'VITE_']);
const siteUrl = env.VITE_APP_URL || 'https://gutenku.xyz';

const gutenguessBasePath =
  env.GUTENGUESS_PATH ||
  resolve(dirname(fileURLToPath(import.meta.url)), '../../private/gutenguess');
const privateGamePath = resolve(gutenguessBasePath, 'packages/front');
const isGameEnabled = existsSync(privateGamePath);
const gameModulePath = isGameEnabled
  ? privateGamePath
  : resolve(
      dirname(fileURLToPath(import.meta.url)),
      './src/features/game-stub',
    );

const vendorChunks: Record<string, string[]> = {
  'vue-core': ['vue', 'vue-router', 'pinia'],
  graphql: ['@urql/vue', 'graphql', 'graphql-ws'],
  vueuse: ['@vueuse/core', '@vueuse/motion'],
  i18n: ['vue-i18n'],
  icons: ['lucide-vue-next'],
};

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    {
      name: 'html-url-transform',
      transformIndexHtml(html) {
        return html.replaceAll('https://gutenku.xyz', siteUrl);
      },
    },
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
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,ico,png,webp,woff2}'],
        globIgnores: ['**/bundle-stats.html'],
        navigateFallback: undefined,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.webp$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cover-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /^https:\/\/beamanalytics\.b-cdn\.net\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: false,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: isSsrBuild
          ? undefined
          : (id) => {
              for (const [chunkName, modules] of Object.entries(vendorChunks)) {
                if (
                  modules.some((mod) => id.includes(`/node_modules/${mod}/`))
                ) {
                  return chunkName;
                }
              }
            },
      },
    },
  },
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@/features/game': gameModulePath,
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    dedupe: [
      'vue',
      'pinia',
      'vue-router',
      'vue-i18n',
      '@urql/vue',
      'graphql',
      '@vueuse/core',
      '@vueuse/motion',
      'lucide-vue-next',
      '@unhead/vue',
    ],
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
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    beastiesOptions: {
      preload: 'media',
    },
    includedRoutes(paths) {
      const ssgRoutes = ['/', '/haiku'];
      return [...new Set([...paths, ...ssgRoutes])];
    },
  },
}));
