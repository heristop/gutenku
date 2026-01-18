import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    locale: { value: 'en' },
  })),
}));

// Mock content imports
vi.mock('@content/*.md', () => ({}));

describe('useArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be importable', async () => {
    const module = await import('@/features/blog/composables/article');
    expect(module.useArticles).toBeDefined();
  });

  it('should expose articles computed', async () => {
    const { useArticles } = await import('@/features/blog/composables/article');
    const { articles } = useArticles();

    expect(articles).toBeDefined();
    expect(Array.isArray(articles.value)).toBe(true);
  });

  it('should expose formatDate function', async () => {
    const { useArticles } = await import('@/features/blog/composables/article');
    const { formatDate } = useArticles();

    expect(typeof formatDate).toBe('function');
  });

  it('should format date correctly', async () => {
    const { useArticles } = await import('@/features/blog/composables/article');
    const { formatDate } = useArticles();

    const date = new Date('2024-01-15');
    const formatted = formatDate(date);

    expect(formatted).toContain('2024');
  });

  it('should expose getReadingTime function', async () => {
    const { useArticles } = await import('@/features/blog/composables/article');
    const { getReadingTime } = useArticles();

    expect(typeof getReadingTime).toBe('function');
  });

  it('should calculate reading time based on word count', async () => {
    const { useArticles } = await import('@/features/blog/composables/article');
    const { getReadingTime } = useArticles();

    // 200 words at 200 wpm = 1 minute (use trim to avoid trailing space issue)
    const shortContent = 'word '.repeat(200).trim();
    expect(getReadingTime(shortContent)).toBe(1);

    // 400 words at 200 wpm = 2 minutes
    const longContent = 'word '.repeat(400).trim();
    expect(getReadingTime(longContent)).toBe(2);

    // 201 words = ceil(201/200) = 2 minutes
    const mediumContent = 'word '.repeat(201).trim();
    expect(getReadingTime(mediumContent)).toBe(2);
  });
});

describe('useArticle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be importable', async () => {
    const module = await import('@/features/blog/composables/article');
    expect(module.useArticle).toBeDefined();
  });

  it('should accept slug as string', async () => {
    const { useArticle } = await import('@/features/blog/composables/article');

    expect(() => useArticle('test-slug')).not.toThrow();
  });

  it('should expose article computed', async () => {
    const { useArticle } = await import('@/features/blog/composables/article');
    const { article } = useArticle('test-slug');

    expect(article).toBeDefined();
  });

  it('should expose content ref', async () => {
    const { useArticle } = await import('@/features/blog/composables/article');
    const { content } = useArticle('test-slug');

    expect(content).toBeDefined();
  });

  it('should expose loading ref', async () => {
    const { useArticle } = await import('@/features/blog/composables/article');
    const { loading } = useArticle('test-slug');

    expect(loading).toBeDefined();
    expect(loading.value).toBe(true); // Starts loading
  });

  it('should expose notFound computed', async () => {
    const { useArticle } = await import('@/features/blog/composables/article');
    const { notFound } = useArticle('nonexistent-slug');

    expect(notFound).toBeDefined();
  });

  it('should expose readingTime computed', async () => {
    const { useArticle } = await import('@/features/blog/composables/article');
    const { readingTime } = useArticle('test-slug');

    expect(readingTime).toBeDefined();
    expect(typeof readingTime.value).toBe('number');
  });

  it('should expose formattedDate computed', async () => {
    const { useArticle } = await import('@/features/blog/composables/article');
    const { formattedDate } = useArticle('test-slug');

    expect(formattedDate).toBeDefined();
  });

  it('should expose navigation articles', async () => {
    const { useArticle } = await import('@/features/blog/composables/article');
    const { nextArticle, prevArticle } = useArticle('test-slug');

    expect(nextArticle).toBeDefined();
    expect(prevArticle).toBeDefined();
  });

  it('should expose showContent ref', async () => {
    const { useArticle } = await import('@/features/blog/composables/article');
    const { showContent } = useArticle('test-slug');

    expect(showContent).toBeDefined();
    expect(showContent.value).toBe(false); // Starts hidden
  });
});
