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
import { marked } from 'marked';
import { useI18n } from 'vue-i18n';

export interface Article {
  content: string;
  date: Date;
  filename: string;
  slug: string;
  title: string;
  description: string;
  image: string;
}

// Import all markdown files from content directory
const articlesRaw = import.meta.glob('@content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Extract slug from filename
 * Example: "2026-01-13-gutenku-when-two-frauds-make-a-truth.md" → "gutenku-when-two-frauds-make-a-truth"
 */
function getSlugFromFilename(filename: string): string {
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}-/, '') // Remove date prefix
    .replace(/\.md$/, ''); // Remove .md extension
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
    body,
  };
}

function parseArticle(path: string, rawContent: string): Article {
  const filename = path.split('/').pop() || '';
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? new Date(dateMatch[1]) : new Date();
  const slug = getSlugFromFilename(filename);
  const { title, description, image, body } = extractMetadata(rawContent);

  return {
    content: body, // Use body without frontmatter
    date,
    filename,
    slug,
    title,
    description,
    image,
  };
}

function getAllArticles(): Article[] {
  const sortedPaths = Object.keys(articlesRaw).sort().reverse();
  return sortedPaths.map((path) => parseArticle(path, articlesRaw[path]));
}

// Cached articles list
const cachedArticles = getAllArticles();

/**
 * Composable for listing all articles (for blog index page)
 */
export function useArticles() {
  const { locale } = useI18n();

  const articles = computed(() => cachedArticles);

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
 */
export function useArticle(slugRef: MaybeRef<string>) {
  const { locale } = useI18n();

  const article = computed(() => {
    const currentSlug = toValue(slugRef);
    return cachedArticles.find((a) => a.slug === currentSlug) || null;
  });

  const content = ref('');
  const loading = ref(true);
  const showContent = ref(false);
  const notFound = computed(() => article.value === null);

  // Find adjacent articles for navigation
  const currentIndex = computed(() => {
    if (!article.value) {
      return -1;
    }
    const currentSlug = toValue(slugRef);
    return cachedArticles.findIndex((a) => a.slug === currentSlug);
  });

  const nextArticle = computed(() => {
    const idx = currentIndex.value;
    if (idx === -1 || idx >= cachedArticles.length - 1) {
      return null;
    }
    return cachedArticles[idx + 1];
  });

  const prevArticle = computed(() => {
    const idx = currentIndex.value;
    if (idx <= 0) {
      return null;
    }
    return cachedArticles[idx - 1];
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

  async function renderMermaidDiagrams() {
    const mermaid = await import('mermaid');
    mermaid.default.initialize({
      startOnLoad: false,
      theme: 'base',
      fontFamily: '"JMH Typewriter", monospace',
      themeVariables: {
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
      },
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

      const hasMermaid = article.value?.content.includes('```mermaid');
      if (hasMermaid) {
        await nextTick();
        await renderMermaidDiagrams();
      }
    }, 50);
  }

  onMounted(() => {
    loadArticle();
  });

  // Watch for slug changes (reacts to route param changes)
  watch(
    () => toValue(slugRef),
    () => {
      loadArticle();
    },
  );

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
