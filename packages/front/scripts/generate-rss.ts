import { writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.VITE_APP_URL || 'https://gutenku.xyz';

interface Article {
  title: string;
  description: string;
  date: string;
  slug: string;
}

function extractFrontmatter(content: string): { description?: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return {};
  }

  const frontmatter: { description?: string } = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const descMatch = line.match(/^description:\s*(.+)$/);
    if (descMatch) {
      frontmatter.description = descMatch[1].trim();
    }
  }

  return frontmatter;
}

function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractFirstParagraph(content: string): string | null {
  const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n*/, '');
  const withoutTitle = withoutFrontmatter.replace(/^#\s+.+\n*/, '');
  const paragraphMatch = withoutTitle.match(/^([A-Za-z].+?)(?:\n\n|\n#|$)/m);
  return paragraphMatch
    ? paragraphMatch[1].replaceAll(/[_*]/g, '').trim()
    : null;
}

function getBlogArticles(): Article[] {
  const contentDir = resolve(__dirname, '../content');
  const files = readdirSync(contentDir).filter((f) => f.endsWith('.en.md'));

  return files
    .map((file) => {
      const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.en\.md$/);
      if (!match) {
        return null;
      }

      const [, date, slug] = match;
      const content = readFileSync(resolve(contentDir, file), 'utf-8');

      const frontmatter = extractFrontmatter(content);
      const title = extractTitle(content);
      const description =
        frontmatter.description || extractFirstParagraph(content) || '';

      if (!title) {
        return null;
      }

      return {
        title,
        description,
        date,
        slug,
      };
    })
    .filter(Boolean) as Article[];
}

function escapeXml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&apos;');
}

function generateAtomFeed(): string {
  const articles = getBlogArticles().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const latestDate =
    articles.length > 0
      ? articles[0].date
      : new Date().toISOString().split('T')[0];

  const entries = articles
    .map(
      (article) => `  <entry>
    <title>${escapeXml(article.title)}</title>
    <link href="${BASE_URL}/blog/${article.slug}"/>
    <id>${BASE_URL}/blog/${article.slug}</id>
    <updated>${article.date}T00:00:00Z</updated>
    <published>${article.date}T00:00:00Z</published>
    <summary>${escapeXml(article.description)}</summary>
  </entry>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>GutenKu Blog</title>
  <subtitle>Articles about AI haiku generation and classic literature</subtitle>
  <link href="${BASE_URL}/blog"/>
  <link href="${BASE_URL}/feed.xml" rel="self"/>
  <id>${BASE_URL}/blog</id>
  <updated>${latestDate}T00:00:00Z</updated>
  <author>
    <name>Alexandre Mederic Mogère</name>
    <uri>https://www.instagram.com/heristop/</uri>
  </author>

${entries}
</feed>`;
}

const feed = generateAtomFeed();
const outputPath = resolve(__dirname, '../public/feed.xml');

writeFileSync(outputPath, feed);
console.log(`RSS feed generated at ${outputPath}`);
