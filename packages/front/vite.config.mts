// Plugins
import vue from '@vitejs/plugin-vue';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';
import webfontDownload from 'vite-plugin-webfont-dl';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

// Utilities
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { resolve, dirname, join } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { brotliCompress, constants as zlibConstants } from 'node:zlib';

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

const brotli = promisify(brotliCompress);

/**
 * Writes a .br copy of every JS and CSS asset of the client build, next to the
 * .gz ones from vite-plugin-compression (a second instance of that plugin
 * writes nothing). The vhost serves the .br first: ~10% fewer bytes than gzip
 * on the entry scripts.
 */
function brotliPrecompress(): Plugin {
  let assetsDir = '';

  return {
    name: 'gutenku:brotli-precompress',
    apply: 'build',
    configResolved(config) {
      assetsDir = resolve(
        config.root,
        config.build.outDir,
        config.build.assetsDir,
      );
    },
    async closeBundle() {
      if (!existsSync(assetsDir)) {
        return;
      }

      const files = readdirSync(assetsDir, {
        recursive: true,
        encoding: 'utf8',
      })
        .filter((file) => /\.(?:js|css)$/.test(file))
        .map((file) => join(assetsDir, file));

      await Promise.all(
        files.map(async (file) => {
          const source = await readFile(file);

          // Below ~1 KB the encoding overhead outweighs the saving
          if (source.length < 1024) {
            return;
          }

          const compressed = await brotli(source, {
            params: {
              [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
              [zlibConstants.BROTLI_PARAM_SIZE_HINT]: source.length,
            },
          });

          await writeFile(`${file}.br`, compressed);
        }),
      );
    },
  };
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

/** Cloudflare serves its beacon from one origin, and collects on the same one. */
const CLOUDFLARE_ORIGIN = 'https://static.cloudflareinsights.com';

interface AnalyticsOrigins {
  /** Origins worth a preconnect hint, whoever hosts them. */
  preconnect: string[];
  /**
   * Origins a `NetworkOnly` pattern is built for — env-derived ones only. Every
   * hostname this file knows as a literal is kept out and given a literal rule
   * below instead: a constant spliced into a constructed regex is what CodeQL
   * flags, and escaping it by hand is the fragile half of the fix.
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
/** The Umami origins, or none when it is not the configured tracker. */
function umamiOrigins(modeEnv: Record<string, string>): string[] {
  const scriptSrc = modeEnv.VITE_UMAMI_SRC?.trim() || '';
  const websiteId = modeEnv.VITE_UMAMI_WEBSITE_ID?.trim() || '';

  if (!scriptSrc || !websiteId) {
    return [];
  }

  // Deduplicated: script and collect API usually share a single origin.
  return [
    ...new Set([
      originOf(scriptSrc),
      originOf(modeEnv.VITE_UMAMI_HOST_URL?.trim() || ''),
    ]),
  ].filter((origin): origin is string => Boolean(origin));
}

function analyticsOrigins(mode: string): AnalyticsOrigins {
  const modeEnv = loadEnv(mode, process.cwd(), ['VITE_']);
  const umami = umamiOrigins(modeEnv);

  if (umami.length > 0) {
    return { preconnect: umami, selfHosted: umami };
  }

  if (modeEnv.VITE_CLOUDFLARE_TOKEN?.trim()) {
    // `selfHosted` stays empty: the beacon has a literal caching rule below,
    // so this constant never reaches a built pattern.
    return { preconnect: [CLOUDFLARE_ORIGIN], selfHosted: [] };
  }

  return { preconnect: [], selfHosted: [] };
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

/**
 * Packages only the blog's diagram and math renderers pull in (mermaid and its
 * dependency tree, KaTeX). Their chunks go to assets/renderers/ so the service
 * worker can leave them out of the precache: three articles use them, and
 * every install would otherwise download ~3.5 MB for them.
 */
const RENDERER_PACKAGES = new RegExp(
  String.raw`/node_modules/(?:\.pnpm/[^/]+/node_modules/)?(?:` +
    [
      'mermaid',
      '@mermaid-js/[^/]+',
      'katex',
      'cytoscape[^/]*',
      'elkjs',
      'dagre-d3-es',
      'd3(?:-[^/]+)?',
      'khroma',
      'lodash-es',
      'internmap',
      'dayjs',
      'uuid',
      'stylis',
      'dompurify',
      'roughjs',
      'layout-base',
      'cose-base',
      'es-toolkit',
      'ts-dedent',
      '@braintree/sanitize-url',
      '@iconify/[^/]+',
      'langium',
      'chevrotain[^/]*',
      '@chevrotain/[^/]+',
      'vscode-[^/]+',
    ].join('|') +
    ')/',
);

function isRendererChunk(moduleIds: readonly string[]): boolean {
  // A chunk shared with app code stays in the precache, whatever else it
  // holds. Virtual modules (the bundler runtime) have no file path to judge.
  const files = moduleIds.filter((id) => id.startsWith('/'));

  return (
    files.some((id) => RENDERER_PACKAGES.test(id)) &&
    files.every((id) => id.includes('/node_modules/'))
  );
}

const vendorChunks: Record<string, string[]> = {
  'vue-core': ['vue', 'vue-router', 'pinia'],
  graphql: ['@urql/vue', 'graphql', 'graphql-ws'],
  vueuse: ['@vueuse/core', '@vueuse/motion'],
  i18n: ['vue-i18n'],
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
      !isSsrBuild && brotliPrecompress(),
      viteImagemin(),
      webfontDownload(),
      // Client build only: the SSR pass runs second and would overwrite the
      // report with the server bundle, which ships to no browser.
      !isSsrBuild &&
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
          // The precache is what every visitor downloads on install, so it
          // holds the app shell only. Left out, and cached on first use by the
          // runtime rules below instead:
          // - book covers (~11 MB) and article illustrations (~2 MB);
          // - the full-size artwork, only for sharing and the 404 page;
          // - the blog's diagram and math renderers (incl. mermaid's ELK) and
          //   the KaTeX and OpenDyslexic fonts, which only some pages load.
          globIgnores: [
            '**/bundle-stats.html',
            'covers/**',
            'article/**',
            'gutenmage.png',
            'gutenmage.webp',
            'gutenmage-1024.webp',
            'og-image.png',
            'assets/renderers/**',
            'assets/KaTeX_*',
            'assets/katex-*.css',
            'assets/OpenDyslexic-*',
          ],
          navigateFallback: undefined,
          runtimeCaching: [
            {
              // Hashed files never change under one URL: serve them from the
              // cache once fetched (renderers, KaTeX and dyslexia fonts).
              urlPattern: ({ sameOrigin, url }) =>
                sameOrigin && url.pathname.startsWith('/assets/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'lazy-assets',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
            {
              // Covers, article illustrations and artwork: same origin, so the
              // https-only rule below never matched them in development.
              urlPattern: ({ sameOrigin, url }) =>
                sameOrigin &&
                /^\/(?:covers|article)\/|^\/gutenmage[^/]*\.webp$/.test(
                  url.pathname,
                ),
              handler: 'CacheFirst',
              options: {
                cacheName: 'site-images',
                expiration: {
                  maxEntries: 250,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
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
              // Never cache Cloudflare's beacon: a stale script, or a replayed
              // collect served from the cache, corrupts the data it is meant to
              // report. A literal pattern with its dots escaped, not one built
              // from the constant above.
              urlPattern: /^https:\/\/static\.cloudflareinsights\.com\//,
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
          chunkFileNames: isSsrBuild
            ? undefined
            : (chunk) =>
                isRendererChunk(chunk.moduleIds)
                  ? 'assets/renderers/[name]-[hash].js'
                  : 'assets/[name]-[hash].js',
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

        // The home route's empty child path comes through as '' and was
        // rendered a second time, to dist/.html. The catch-all 404 route
        // (`:pathMatch(.*)*`) is dynamic: left in, it lands as a stray
        // `dist/:pathMatch(.*)*.html` that nothing serves.
        return [
          ...new Set(
            [...paths, ...ssgRoutes]
              .filter((path) => !path.includes(':'))
              .map((path) => path || '/'),
          ),
        ];
      },
    },
  };
});
