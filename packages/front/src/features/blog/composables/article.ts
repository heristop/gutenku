import {
  type Ref,
  type ComputedRef,
  ref,
  computed,
  onMounted,
  nextTick,
  watch,
  toValue,
} from 'vue';
import { marked, type Renderer } from 'marked';
import { useI18n } from 'vue-i18n';
import {
  type SupportedLocale,
  DEFAULT_LOCALE,
  SITE_URL,
} from '@/locales/config';

// Configure marked to add target="_blank" for external links
const renderer: Partial<Renderer> = {
  link({ href, title, text }) {
    const isExternal =
      href && !href.startsWith('/') && !href.startsWith(SITE_URL);
    const titleAttr = title ? ` title="${title}"` : '';
    const externalAttrs = isExternal
      ? ' target="_blank" rel="noopener noreferrer"'
      : '';
    return `<a href="${href}"${titleAttr}${externalAttrs}>${text}</a>`;
  },
};

marked.use({ renderer });

export interface Article {
  content: string;
  date: Date;
  filename: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  locale: SupportedLocale;
}

// Import all markdown files from content directory
const articlesRaw = import.meta.glob('@content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Extract locale from filename
 * Example: "2026-01-18-gutenku-technical-deep-dive.fr.md" → "fr"
 * Example: "2026-01-18-gutenku-technical-deep-dive.en.md" → "en"
 */
function getLocaleFromPath(filename: string): SupportedLocale {
  const match = filename.match(/\.(en|fr|ja)\.md$/);
  return (match?.[1] as SupportedLocale) || DEFAULT_LOCALE;
}

/**
 * Extract slug from filename
 * Example: "2026-01-13-gutenku-when-two-frauds-make-a-truth.en.md" → "gutenku-when-two-frauds-make-a-truth"
 */
function getSlugFromFilename(filename: string): string {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}-/, '') // Remove date prefix
    .replace(/\.(en|fr|ja)?\.md$/, ''); // Remove locale and .md extension
}

interface Frontmatter {
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
function parseFrontmatter(content: string): {
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

function extractMetadata(content: string): {
  title: string;
  description: string;
  image: string;
  body: string;
} {
  const { frontmatter, body } = parseFrontmatter(content);

  // Extract title from first H1 (# Title)
  const titleMatch = body.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'GutenKu Blog';

  // Remove the first H1 from body (it's displayed in header)
  const bodyWithoutTitle = titleMatch ? body.replace(/^#\s+.+\n*/, '') : body;

  // Use frontmatter image or extract first image from content
  let image = frontmatter.image;
  if (!image) {
    const imageMatch = body.match(/!\[.*?\]\(([^)]+)\)/);
    image = imageMatch ? imageMatch[1] : '/og-image.png';
  }

  // Use frontmatter description or extract from content
  let description = frontmatter.description;
  if (!description) {
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
      if (!trimmed || trimmed.startsWith('!') || trimmed.startsWith('_')) {
        continue;
      }
      if (trimmed.startsWith('#')) {
        continue;
      }
      if (/^[-*_]{3,}$/.test(trimmed)) {
        continue;
      }

      description = trimmed
        .replaceAll(/\*\*([^*]+)\*\*/g, '$1')
        .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replaceAll(/_([^_]+)_/g, '$1')
        .slice(0, 160);
      break;
    }
  }

  return {
    title,
    description:
      description ||
      'Articles about GutenKu, AI haiku generation, and classic literature.',
    image,
    body: bodyWithoutTitle,
  };
}

function parseArticle(path: string, rawContent: string): Article {
  const filename = path.split('/').pop() || '';
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? new Date(dateMatch[1]) : new Date();
  const slug = getSlugFromFilename(filename);
  const locale = getLocaleFromPath(filename);
  const { title, description, image, body } = extractMetadata(rawContent);

  return {
    content: body,
    date,
    filename,
    slug,
    title,
    description,
    image,
    locale,
  };
}

function getAllArticles(): Article[] {
  const sortedPaths = Object.keys(articlesRaw).sort().reverse();
  return sortedPaths.map((path) => parseArticle(path, articlesRaw[path]));
}

// Cached articles list (all locales)
const cachedArticles = getAllArticles();

// Build articles indexed by slug+locale for quick lookup
const articlesBySlugAndLocale = new Map<string, Article>();
for (const article of cachedArticles) {
  const key = `${article.slug}:${article.locale}`;
  articlesBySlugAndLocale.set(key, article);
}

// Get unique slugs (for listing purposes)
const uniqueSlugs = [...new Set(cachedArticles.map((a) => a.slug))];

/**
 * Get all available locales for a given slug
 */
export function getAvailableLocalesForSlug(slug: string): SupportedLocale[] {
  const locales: SupportedLocale[] = [];
  for (const article of cachedArticles) {
    if (article.slug === slug) {
      locales.push(article.locale);
    }
  }
  return locales;
}

/**
 * Get article by slug and locale, with fallback to English
 */
function getArticleBySlugAndLocale(
  slug: string,
  locale: SupportedLocale,
): Article | null {
  // Try requested locale first
  const key = `${slug}:${locale}`;
  const article = articlesBySlugAndLocale.get(key);
  if (article) {
    return article;
  }

  // Fallback to English
  const fallbackKey = `${slug}:${DEFAULT_LOCALE}`;
  return articlesBySlugAndLocale.get(fallbackKey) || null;
}

/**
 * Composable for listing all articles (for blog index page)
 * Returns articles for the current locale with English fallback
 */
export function useArticles() {
  const { locale } = useI18n();

  const articles = computed(() => {
    const currentLocale = locale.value as SupportedLocale;
    const result: Article[] = [];

    for (const slug of uniqueSlugs) {
      const article = getArticleBySlugAndLocale(slug, currentLocale);
      if (article) {
        result.push(article);
      }
    }

    // Sort by date descending
    return result.sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  function formatDate(date: Date): string {
    return date.toLocaleDateString(locale.value, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }

  function getReadingTime(content: string): number {
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  }

  return {
    articles,
    formatDate,
    getReadingTime,
  };
}

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>;

/**
 * Composable for viewing a single article by slug
 * Accepts a static string, Ref, or ComputedRef for reactive slug changes
 * Returns article for current locale with English fallback
 */
export function useArticle(slugRef: MaybeRef<string>) {
  const { locale } = useI18n();

  const article = computed(() => {
    const currentSlug = toValue(slugRef);
    const currentLocale = locale.value as SupportedLocale;
    return getArticleBySlugAndLocale(currentSlug, currentLocale);
  });

  const content = ref('');
  const loading = ref(true);
  const showContent = ref(false);
  const notFound = computed(() => article.value === null);

  // Get sorted articles for current locale
  const sortedLocaleArticles = computed(() => {
    const currentLocale = locale.value as SupportedLocale;
    const localeArticles: Article[] = [];
    for (const slug of uniqueSlugs) {
      const art = getArticleBySlugAndLocale(slug, currentLocale);
      if (art) {
        localeArticles.push(art);
      }
    }
    return localeArticles.sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  // Find adjacent articles for navigation (in current locale)
  const currentIndex = computed(() => {
    if (!article.value) {
      return -1;
    }
    return sortedLocaleArticles.value.findIndex(
      (a) => a.slug === article.value?.slug,
    );
  });

  const nextArticle = computed(() => {
    const idx = currentIndex.value;
    const articles = sortedLocaleArticles.value;
    if (idx === -1 || idx >= articles.length - 1) {
      return null;
    }
    return articles[idx + 1];
  });

  const prevArticle = computed(() => {
    const idx = currentIndex.value;
    if (idx <= 0) {
      return null;
    }
    return sortedLocaleArticles.value[idx - 1];
  });

  const readingTime = computed(() => {
    if (!article.value) {
      return 0;
    }
    const wordCount = article.value.content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  });

  const formattedDate = computed(() => {
    if (!article.value) {
      return '';
    }
    return article.value.date.toLocaleDateString(locale.value, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  });

  async function renderMathFormulas() {
    const katex = await import('katex');
    await import('katex/dist/katex.min.css');

    const contentEl = document.querySelector('.blog-article__body');
    if (!contentEl) {return;}

    // Match $$ ... $$ (display math) - marked may wrap in <p> tags
    const mathRegex = /\$\$([\s\S]*?)\$\$/g;

    // Process all elements that might contain math
    const elements = contentEl.querySelectorAll('p, li, td');
    for (const el of elements) {
      if (el.innerHTML.includes('$$')) {
        el.innerHTML = el.innerHTML.replace(mathRegex, (_, tex) => {
          try {
            return `<span class="katex-display">${katex.default.renderToString(
              tex.trim(),
              {
                displayMode: true,
                throwOnError: false,
              },
            )}</span>`;
          } catch {
            return `<code class="katex-error">${tex}</code>`;
          }
        });
      }
    }
  }

  async function renderMermaidDiagrams() {
    const mermaid = await import('mermaid');
    const isDark =
      document.documentElement.getAttribute('data-theme') === 'dark';

    const lightTheme = {
      background: 'transparent',
      primaryColor: '#e8e2d9',
      secondaryColor: '#f5f0e8',
      tertiaryColor: '#dcd5c9',
      primaryBorderColor: '#5a7a6b',
      secondaryBorderColor: '#7a9a8b',
      lineColor: '#5a7a6b',
      textColor: '#2d3b35',
      primaryTextColor: '#2d3b35',
      secondaryTextColor: '#2d3b35',
      tertiaryTextColor: '#2d3b35',
      nodeTextColor: '#2d3b35',
      nodeBorder: '#5a7a6b',
      clusterBkg: '#f5f0e8',
      edgeLabelBackground: '#f5f0e8',
      fontFamily: '"JMH Typewriter", monospace',
    };

    const darkTheme = {
      background: 'transparent',
      primaryColor: '#2a3a35',
      secondaryColor: '#1e2d28',
      tertiaryColor: '#243530',
      primaryBorderColor: '#6b9a8b',
      secondaryBorderColor: '#5a8a7b',
      lineColor: '#6b9a8b',
      textColor: '#c8d5d0',
      primaryTextColor: '#c8d5d0',
      secondaryTextColor: '#b8c5c0',
      tertiaryTextColor: '#a8b5b0',
      nodeTextColor: '#c8d5d0',
      nodeBorder: '#6b9a8b',
      clusterBkg: '#1e2d28',
      edgeLabelBackground: '#2a3a35',
      fontFamily: '"JMH Typewriter", monospace',
    };

    mermaid.default.initialize({
      startOnLoad: false,
      theme: 'base',
      fontFamily: '"JMH Typewriter", monospace',
      themeVariables: isDark ? darkTheme : lightTheme,
    });

    const mermaidBlocks = document.querySelectorAll(
      'pre code.language-mermaid',
    );
    for (const block of mermaidBlocks) {
      const pre = block.parentElement;
      if (pre) {
        const code = block.textContent || '';
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.default.render(id, code);
        const div = document.createElement('div');
        div.className = 'mermaid-diagram';
        div.innerHTML = svg;
        pre.replaceWith(div);
      }
    }
  }

  async function loadArticle() {
    if (!article.value) {
      loading.value = false;
      return;
    }

    loading.value = true;
    showContent.value = false;
    content.value = await marked(article.value.content);
    loading.value = false;

    setTimeout(async () => {
      showContent.value = true;
      await nextTick();

      const hasMermaid = article.value?.content.includes('```mermaid');
      if (hasMermaid) {
        await renderMermaidDiagrams();
      }

      const hasMath = article.value?.content.includes('$$');
      if (hasMath) {
        await renderMathFormulas();
      }
    }, 50);
  }

  onMounted(() => {
    loadArticle();
  });

  // Watch for slug or locale changes
  watch([() => toValue(slugRef), () => locale.value], () => {
    loadArticle();
  });

  return {
    article,
    content,
    loading,
    showContent,
    notFound,
    readingTime,
    formattedDate,
    nextArticle,
    prevArticle,
  };
}
