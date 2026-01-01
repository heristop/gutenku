import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://gutenku.xyz';

const routes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/game', priority: '0.9', changefreq: 'daily' },
  { path: '/haiku', priority: '0.9', changefreq: 'weekly' },
];

function generateSitemap(): string {
  const today = new Date().toISOString().split('T')[0];

  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

const sitemap = generateSitemap();
const outputPath = resolve(__dirname, '../public/sitemap.xml');

writeFileSync(outputPath, sitemap);
console.log(`Sitemap generated at ${outputPath}`);
