import { ref, computed, onMounted, nextTick } from 'vue';
import { marked } from 'marked';
import { useI18n } from 'vue-i18n';

export interface Article {
  content: string;
  date: Date;
  filename: string;
  title: string;
  description: string;
  image: string;
}

// Import all markdown files from content directory
const articles = import.meta.glob('@content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function extractMetadata(content: string): {
  title: string;
  description: string;
  image: string;
} {
  // Extract title from first H1 (# Title)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'GutenKu Blog';

  // Extract first image for og:image
  const imageMatch = content.match(/!\[.*?\]\(([^)]+)\)/);
  const image = imageMatch ? imageMatch[1] : '/og-image.png';

  // Extract description from first paragraph after title (skip images and italic subtitles)
  const lines = content.split('\n');
  let description = '';
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
    // Skip empty lines, images, and italic lines (subtitles)
    if (!trimmed || trimmed.startsWith('!') || trimmed.startsWith('_')) {
      continue;
    }
    // Skip headings
    if (trimmed.startsWith('#')) {
      continue;
    }
    // Found a paragraph - clean it up
    description = trimmed
      .replaceAll(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replaceAll(/_([^_]+)_/g, '$1') // Remove italic
      .slice(0, 160);
    break;
  }

  return {
    title,
    description:
      description ||
      'Articles about GutenKu, AI haiku generation, and classic literature.',
    image,
  };
}

function getLatestArticle(): Article {
  const sortedPaths = Object.keys(articles).sort().reverse();
  const latestPath = sortedPaths[0];

  if (!latestPath) {
    return {
      content: '',
      date: new Date(),
      filename: '',
      title: '',
      description: '',
      image: '',
    };
  }

  // Extract date from filename (format: YYYY-MM-DD-title.md)
  const filename = latestPath.split('/').pop() || '';
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? new Date(dateMatch[1]) : new Date();

  const content = articles[latestPath];
  const { title, description, image } = extractMetadata(content);

  return {
    content,
    date,
    filename,
    title,
    description,
    image,
  };
}

export function useArticle() {
  const { locale } = useI18n();
  const article = getLatestArticle();

  const content = ref('');
  const loading = ref(true);
  const showContent = ref(false);

  const readingTime = computed(() => {
    const wordCount = article.content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  });

  const formattedDate = computed(() => {
    return article.date.toLocaleDateString(locale.value, {
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

  onMounted(async () => {
    content.value = await marked(article.content);
    loading.value = false;

    // Trigger fade-in animation after content loads
    setTimeout(async () => {
      showContent.value = true;

      // Lazy load mermaid only if there are mermaid code blocks
      // Must run AFTER showContent is true so DOM elements exist
      const hasMermaid = article.content.includes('```mermaid');
      if (hasMermaid) {
        await nextTick();
        await renderMermaidDiagrams();
      }
    }, 50);
  });

  return {
    article,
    content,
    loading,
    showContent,
    readingTime,
    formattedDate,
  };
}
