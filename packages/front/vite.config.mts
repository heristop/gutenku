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

// Load env for gutenguess path override
const env = loadEnv('', process.cwd(), 'GUTENGUESS_');

// Allow override via env for local development
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

// Vendor chunk configuration for client build
const vendorChunks: Record<string, string[]> = {
  'vue-core': ['vue', 'vue-router', 'pinia'],
  graphql: ['@urql/vue', 'graphql', 'graphql-ws'],
  vueuse: ['@vueuse/core', '@vueuse/motion'],
  i18n: ['vue-i18n'],
  icons: ['lucide-vue-next'],
};

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
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
        // Exclude SEO/static files from navigation fallback
        navigateFallbackDenylist: [
          /^\/sitemap\.xml$/,
          /^\/robots\.txt$/,
          /^\/llms\.txt$/,
          /^\/BingSiteAuth\.xml$/,
          /^\/browserconfig\.xml$/,
          /^\/manifest\.json$/,
        ],
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
        // Only apply manualChunks for client build, not SSR
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
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    // Private game module uses main project's dependencies
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
      // Only pre-render Home and 404
      return paths.filter((path) => path === '/' || path.startsWith('/404'));
    },
  },
}));
