import {
  type SupportedLocale,
  DEFAULT_LOCALE,
} from '@/locales/config';

/**
 * Extract locale from filename
 * Example: "2026-01-18-gutenku-technical-deep-dive.fr.md" → "fr"
 * Example: "2026-01-18-gutenku-technical-deep-dive.en.md" → "en"
 */
export function getLocaleFromPath(filename: string): SupportedLocale {
  const match = filename.match(/\.(en|fr|ja)\.md$/);

  return (match?.[1] as SupportedLocale) || DEFAULT_LOCALE;
}

/**
 * Extract slug from filename
 * Example: "2026-01-13-gutenku-when-two-frauds-make-a-truth.en.md" → "gutenku-when-two-frauds-make-a-truth"
 */
export function getSlugFromFilename(filename: string): string {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}-/, '') // Remove date prefix
    .replace(/\.(en|fr|ja)?\.md$/, ''); // Remove locale and .md extension
}

export interface Frontmatter {
  description?: string;
  image?: string;
}

/**
 * Parse YAML frontmatter from markdown content
 * Frontmatter format:
 * ---
 * description: Your description here
 * image: /path/to/image.webp
 * ---
 */
export function parseFrontmatter(content: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatter: Frontmatter = {};
  const yamlContent = match[1];

  // Parse simple key: value pairs
  for (const line of yamlContent.split('\n')) {
    const colonIndex = line.indexOf(':');

    if (colonIndex === -1) {
      continue;
    }

    const key = line.slice(0, colonIndex).trim();
    const value = line
      .slice(colonIndex + 1)
      .trim()
      .replaceAll(/^['"]|['"]$/g, '');

    if (key === 'description') {
      frontmatter.description = value;
    }
    
if (key === 'image') {
      frontmatter.image = value;
    }
  }

  const body = content.slice(match[0].length);
  
return { frontmatter, body };
}

function extractTitle(body: string): { title: string; bodyWithoutTitle: string } {
  const titleMatch = body.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'GutenKu Blog';
  const bodyWithoutTitle = titleMatch ? body.replace(/^#\s+.+\n*/, '') : body;
  
return { title, bodyWithoutTitle };
}

function extractImage(body: string, frontmatterImage: string | undefined): string {
  if (frontmatterImage) {
    return frontmatterImage;
  }
  const imageMatch = body.match(/!\[.*?\]\(([^)]+)\)/);
  
return imageMatch ? imageMatch[1] : '/og-image.png';
}

function isSkippableDescriptionLine(trimmed: string): boolean {
  if (!trimmed || trimmed.startsWith('!') || trimmed.startsWith('_')) {
    return true;
  }
  
if (trimmed.startsWith('#')) {
    return true;
  }
  
if (/^[-*_]{3,}$/.test(trimmed)) {
    return true;
  }
  
return false;
}

function deriveDescriptionFromBody(body: string): string | undefined {
  const lines = body.split('\n');
  let foundTitle = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
if (trimmed.startsWith('# ')) {
      foundTitle = true;
      continue;
    }
    
if (!foundTitle) {
      continue;
    }
    
if (isSkippableDescriptionLine(trimmed)) {
      continue;
    }

    return trimmed
      .replaceAll(/\*\*([^*]+)\*\*/g, '$1')
      .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replaceAll(/_([^_]+)_/g, '$1')
      .slice(0, 160);
  }

  return undefined;
}

export function extractMetadata(content: string): {
  title: string;
  description: string;
  image: string;
  body: string;
} {
  const { frontmatter, body } = parseFrontmatter(content);

  const { title, bodyWithoutTitle } = extractTitle(body);
  const image = extractImage(body, frontmatter.image);
  const description =
    frontmatter.description || deriveDescriptionFromBody(body);

  return {
    title,
    description:
      description ||
      'Articles about GutenKu, AI haiku generation, and classic literature.',
    image,
    body: bodyWithoutTitle,
  };
}
