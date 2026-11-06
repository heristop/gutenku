import { writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.VITE_APP_URL || 'https://gutenku.xyz';

interface Route {
  path: string;
  priority: string;
  changefreq: string;
  image?: string;
  video?: {
    thumbnail: string;
    title: string;
    description: string;
    content: string;
    duration: number;
  };
}

// Routes that only exist when the game module is installed
const GAME_ROUTES = new Set(['/game', '/how-to-play']);

const staticRoutes: Route[] = [
  { path: '/', priority: '1.0', changefreq: 'daily', image: '/og-image.png' },
  {
    path: '/game',
    priority: '0.9',
    changefreq: 'daily',
    image: '/og-image.png',
  },
  {
    path: '/how-to-play',
    priority: '0.7',
    changefreq: 'monthly',
    image: '/media/gutenguess-promo.jpg',
    video: {
      thumbnail: '/media/gutenguess-promo.jpg',
      title: 'How to play GutenGuess in 40 seconds',
      description:
        'How to play GutenGuess, the daily book guessing game: a 40-second video from the first clue to the stamped result and your personal library.',
      content: '/media/gutenguess-promo.mp4?v=2026-11-06-library',
      duration: 40,
    },
  },
  {
    path: '/haiku',
    priority: '0.9',
    changefreq: 'weekly',
    image: '/og-image.png',
  },
  {
    path: '/about',
    priority: '0.6',
    changefreq: 'monthly',
    image: '/og-image.png',
  },
  {
    path: '/blog',
    priority: '0.8',
    changefreq: 'weekly',
    image: '/og-image.png',
  },
];

function getBlogArticles(): Route[] {
  const contentDir = resolve(__dirname, '../content');
  // Only the default-language documents have independently indexable URLs.
  const files = readdirSync(contentDir)
    .filter((f) => f.endsWith('.en.md'))
    .sort();

  return files
    .map((file) => {
      const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.en\.md$/);

      if (!match) {
        return null;
      }

      const [, , slugPart] = match;
      const content = readFileSync(resolve(contentDir, file), 'utf-8');

      const imageMatch = content.match(/!\[.*?\]\((\/[^)]+)\)/);
      const image = imageMatch?.[1] || '/og-image.png';

      return {
        path: `/blog/${slugPart}`,
        priority: '0.7',
        changefreq: 'monthly',
        image,
      };
    })
    .filter(Boolean) as Route[];
}

export function generateSitemap({
  baseUrl = BASE_URL,
  gameEnabled = true,
}: { baseUrl?: string; gameEnabled?: boolean } = {}): string {
  const origin = baseUrl.replace(/\/+$/, '');
  const escapeXml = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  const blogArticles = getBlogArticles();
  const allRoutes = [
    ...staticRoutes.filter(
      (route) => gameEnabled || !GAME_ROUTES.has(route.path),
    ),
    ...blogArticles,
  ];

  const urls = allRoutes
    .map((route) => {
      const imageTag = route.image
        ? `
    <image:image>
      <image:loc>${escapeXml(`${origin}${route.image}`)}</image:loc>
    </image:image>`
        : '';

      const videoTag = route.video
        ? `
    <video:video>
      <video:thumbnail_loc>${escapeXml(`${origin}${route.video.thumbnail}`)}</video:thumbnail_loc>
      <video:title>${escapeXml(route.video.title)}</video:title>
      <video:description>${escapeXml(route.video.description)}</video:description>
      <video:content_loc>${escapeXml(`${origin}${route.video.content}`)}</video:content_loc>
      <video:duration>${route.video.duration}</video:duration>
    </video:video>`
        : '';

      return `  <url>
    <loc>${escapeXml(`${origin}${route.path}`)}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>${imageTag}${videoTag}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/__sitemap__/style.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls}
</urlset>`;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const sitemap = generateSitemap();
  const outputPath = resolve(__dirname, '../public/sitemap.xml');

  writeFileSync(outputPath, sitemap);
  console.log(`Sitemap generated at ${outputPath}`);
}
