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
import { existsSync, readdirSync } from 'node:fs';

const env = loadEnv('', process.cwd(), ['GUTENGUESS_', 'VITE_']);
const siteUrl = env.VITE_APP_URL || 'https://gutenku.xyz';

// Get blog article slugs for SSG pre-rendering
function getBlogSlugs(): string[] {
  const contentDir = resolve(
    dirname(fileURLToPath(import.meta.url)),
    './content',
  );

  if (!existsSync(contentDir)) {
    return [];
  }
  const files = readdirSync(contentDir).filter((f) => f.endsWith('.md'));
  const slugs = new Set<string>();

  for (const file of files) {
    // Extract slug: "2026-01-13-gutenku-when-two-frauds.en.md" → "gutenku-when-two-frauds"
    const slug = file
      .replace(/^\d{4}-\d{2}-\d{2}-/, '')
      .replace(/\.(en|fr|ja)?\.md$/, '');
    slugs.add(slug);
  }

  return [...slugs];
}

function originOf(url: string): string | undefined {
  try {
    return new URL(url).origin;
  } catch {
    // A relative script src — same origin, so nothing to preconnect to and the
    // app's own caching rules already apply.
    return undefined;
  }
}

const GA_ORIGINS = [
  'https://www.googletagmanager.com',
  'https://region1.google-analytics.com',
];

interface AnalyticsOrigins {
  /** Origins worth a preconnect hint, whoever hosts them. */
  preconnect: string[];
  /**
   * Self-hosted origins only. Kept apart from the GA hosts, which have their
   * own literal caching rule below and never reach a built pattern.
   */
  selfHosted: string[];
}

/**
 * Mirrors resolveAnalyticsMode() in src/services/analytics/config.ts. The build
 * needs the same answer as the app to know which origins to preconnect and
 * which ones must never be served from the service worker cache.
 *
 * Read with the build's own mode rather than the module-scope `env` above,
 * which resolves `.env` only: a production build ships `.env.production`, and a
 * hint pointing at the provider that is not the one loading is worse than none.
 *
 * Like resolveAnalyticsMode(), it reads the env and nothing else. `cap:build`
 * ships this very `dist` to the app stores, so there is no build-time answer to
 * which platform will run it.
 */
function analyticsOrigins(mode: string): AnalyticsOrigins {
  const modeEnv = loadEnv(mode, process.cwd(), ['VITE_']);
  const umamiScriptSrc = modeEnv.VITE_UMAMI_SRC?.trim() || '';
  const umamiWebsiteId = modeEnv.VITE_UMAMI_WEBSITE_ID?.trim() || '';
  const umamiHostUrl = modeEnv.VITE_UMAMI_HOST_URL?.trim() || '';

  if (umamiScriptSrc && umamiWebsiteId) {
    // Deduplicated: script and collect API usually share a single origin.
    const origins = [
      ...new Set([originOf(umamiScriptSrc), originOf(umamiHostUrl)]),
    ].filter((origin): origin is string => Boolean(origin));

    return { preconnect: origins, selfHosted: origins };
  }

  return {
    preconnect: modeEnv.VITE_GA_MEASUREMENT_ID?.trim() ? GA_ORIGINS : [],
    selfHosted: [],
  };
}

/**
 * Matches an origin and everything under it. Every metacharacter is escaped,
 * the dots of the hostname included: left bare, `stats.example.com` would also
 * match `statsXexample.com` — an origin somebody else can register.
 */
function originPrefixPattern(origin: string): RegExp {
  const escaped = origin.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&');

  return new RegExp(`^${escaped}/`);
}

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
  icons: ['@lucide/vue'],
};

export default defineConfig(({ isSsrBuild, mode }) => {
  const trackerOrigins = analyticsOrigins(mode);

  return {
    plugins: [
      {
        name: 'html-url-transform',
        transformIndexHtml(html) {
          return html.replaceAll('https://gutenku.xyz', siteUrl);
        },
      },
      {
        // The hints have to follow the configured provider: left as authored,
        // they would open a connection to Google on every page load of a site
        // that no longer talks to it — and none at all to the one it does.
        name: 'analytics-preconnect',
        transformIndexHtml(html) {
          const links = trackerOrigins.preconnect
            .map((origin) => `<link rel="preconnect" href="${origin}" />`)
            .join('\n    ');

          return html.replace(
            /<!-- analytics-preconnect:start -->[\s\S]*?<!-- analytics-preconnect:end -->/,
            links,
          );
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
              // Never cache the tag or its beacons: a stale gtag.js or a replayed
              // /g/collect would corrupt the data it is meant to report.
              // The subdomain group is optional as a whole: `[a-z0-9-]*\.?`
              // would also match `evilgoogle-analytics.com`, a host anyone can
              // register.
              urlPattern:
                /^https:\/\/(www\.googletagmanager\.com|(?:[a-z0-9-]+\.)?google-analytics\.com)\//,
              handler: 'NetworkOnly',
            },
            // Same reasoning for the self-hosted tracker: script.js is expected to
            // be replaceable on the server, and /api/send must never be replayed
            // from a cache.
            ...trackerOrigins.selfHosted.map((origin) => ({
              urlPattern: originPrefixPattern(origin),
              handler: 'NetworkOnly' as const,
            })),
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
                for (const [chunkName, modules] of Object.entries(
                  vendorChunks,
                )) {
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
        '@lucide/vue',
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
        const blogSlugs = getBlogSlugs();
        const blogRoutes = blogSlugs.map((slug) => `/blog/${slug}`);
        const ssgRoutes = ['/', '/haiku', '/blog', '/game', ...blogRoutes];

        return [...new Set([...paths, ...ssgRoutes])];
      },
    },
  };
});
