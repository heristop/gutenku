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
import {
  extractMetadata,
  getLocaleFromPath,
  getSlugFromFilename,
} from './article-metadata';
import { renderMathFormulas, renderMermaidDiagrams } from './article-rendering';

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

function getReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).length;

  return Math.ceil(wordCount / 200);
}

function parseArticle(path: string, rawContent: string): Article {
  const filename = path.split('/').pop() || '';
  const dateMatch = /^(\d{4}-\d{2}-\d{2})/.exec(filename);
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
  const sortedPaths = Object.keys(articlesRaw).sort((a, b) =>
    b.localeCompare(a),
  );

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
