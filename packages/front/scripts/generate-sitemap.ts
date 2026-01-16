import { writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.VITE_APP_URL || 'https://gutenku.xyz';

interface Route {
  path: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
  image?: string;
}

const staticRoutes: Route[] = [
  { path: '/', priority: '1.0', changefreq: 'daily', image: '/og-image.png' },
  {
    path: '/game',
    priority: '0.9',
    changefreq: 'daily',
    image: '/og-image.png',
  },
  {
    path: '/haiku',
    priority: '0.9',
    changefreq: 'weekly',
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
  const files = readdirSync(contentDir).filter((f) => f.endsWith('.md'));

  return files
    .map((file) => {
      const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
      if (!match) {return null;}

      const [, date, slugPart] = match;
      const content = readFileSync(resolve(contentDir, file), 'utf-8');

      const imageMatch = content.match(/!\[.*?\]\((\/[^)]+)\)/);
      const image = imageMatch?.[1] || '/og-image.png';

      return {
        path: `/blog/${slugPart}`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: date,
        image,
      };
    })
    .filter(Boolean) as Route[];
}

function generateSitemap(): string {
  const today = new Date().toISOString().split('T')[0];
  const blogArticles = getBlogArticles();
  const allRoutes = [...staticRoutes, ...blogArticles];

  const urls = allRoutes
    .map((route) => {
      const lastmod = route.lastmod || today;
      const imageTag = route.image
        ? `
    <image:image>
      <image:loc>${BASE_URL}${route.image}</image:loc>
    </image:image>`
        : '';

      return `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>${imageTag}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}

const sitemap = generateSitemap();
const outputPath = resolve(__dirname, '../public/sitemap.xml');

writeFileSync(outputPath, sitemap);
console.log(`Sitemap generated at ${outputPath}`);
