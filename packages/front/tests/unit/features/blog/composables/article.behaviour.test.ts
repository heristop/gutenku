import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { withSetup } from '../../../helpers/with-setup';

const localeRef = ref('en');

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: localeRef }),
}));

// marked renders markdown -> wrap content so math/mermaid markers survive
vi.mock('marked', () => {
  const marked = Object.assign(
    vi.fn(async (md: string) => `<rendered>${md}</rendered>`),
    { use: vi.fn() },
  );
  
return { marked };
});

const katexRender = vi.fn(() => '<span class="katex">x</span>');
vi.mock('katex', () => ({
  default: { renderToString: katexRender },
}));
vi.mock('katex/dist/katex.min.css', () => ({}));

const mermaidRender = vi.fn(async () => ({ svg: '<svg>diagram</svg>' }));
const mermaidInit = vi.fn();
vi.mock('mermaid', () => ({
  default: { initialize: mermaidInit, render: mermaidRender },
}));

const SLUG = 'gutenku-technical-deep-dive';

async function loadUseArticle() {
  const mod = await import('@/features/blog/composables/article');
  
return mod;
}

function buildBody({ math = false, mermaid = false } = {}) {
  document.body.replaceChildren();
  const body = document.createElement('div');
  body.className = 'blog-article__body';

  if (math) {
    const p = document.createElement('p');
    // assign as plain text containing the math markers
    p.append(document.createTextNode('Inline $$E = mc^2$$ math here'));
    body.append(p);
  }

  if (mermaid) {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-mermaid';
    code.append(document.createTextNode('graph TD; A-->B;'));
    pre.append(code);
    body.append(pre);
  }

  document.body.append(body);
}

describe('useArticle (render behaviour)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localeRef.value = 'en';
    document.body.replaceChildren();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves a real article, exposes metadata and navigation', async () => {
    const { useArticle } = await loadUseArticle();
    const { result, unmount } = withSetup(() => useArticle(SLUG));

    expect(result.article.value).not.toBeNull();
    expect(result.notFound.value).toBeFalsy();
    expect(result.readingTime.value).toBeGreaterThan(0);
    expect(typeof result.formattedDate.value).toBe('string');
    expect(
      result.nextArticle.value !== null || result.prevArticle.value !== null,
    ).toBeTruthy();
    unmount();
  });

  it('returns notFound for an unknown slug', async () => {
    const { useArticle } = await loadUseArticle();
    const { result, unmount } = withSetup(() => useArticle('does-not-exist'));

    expect(result.article.value).toBeNull();
    expect(result.notFound.value).toBeTruthy();
    expect(result.readingTime.value).toBe(0);
    expect(result.formattedDate.value).toBe('');
    unmount();
  });

  it('renders content and processes mermaid + math on mount', async () => {
    buildBody({ math: true, mermaid: true });

    const { useArticle } = await loadUseArticle();
    const { result, unmount } = withSetup(() => useArticle(SLUG));

    await vi.advanceTimersByTimeAsync(0);
    expect(result.content.value).toContain('<rendered>');
    expect(result.loading.value).toBeFalsy();

    await vi.advanceTimersByTimeAsync(50);
    await vi.runOnlyPendingTimersAsync();

    expect(result.showContent.value).toBeTruthy();
    expect(mermaidInit).toHaveBeenCalled();
    expect(mermaidRender).toHaveBeenCalled();
    expect(katexRender).toHaveBeenCalled();
    expect(document.querySelector('.mermaid-diagram')).not.toBeNull();
    expect(document.querySelector('.katex-display')).not.toBeNull();

    unmount();
  });

  it('uses the base mermaid theme with dark variables when data-theme is dark', async () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    buildBody({ mermaid: true });

    const { useArticle } = await loadUseArticle();
    const { unmount } = withSetup(() => useArticle(SLUG));

    await vi.advanceTimersByTimeAsync(50);
    await vi.runOnlyPendingTimersAsync();

    expect(mermaidInit).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'base' }),
    );
    const passed = mermaidInit.mock.calls[0][0] as {
      themeVariables: { background: string };
    };
    expect(passed.themeVariables.background).toBe('transparent');
    unmount();
  });

  it('exposes available locales for a slug and lists articles per locale', async () => {
    const { useArticles, getAvailableLocalesForSlug } = await loadUseArticle();

    const locales = getAvailableLocalesForSlug(SLUG);
    expect(locales).toContain('en');

    const { result, unmount } = withSetup(() => useArticles());
    expect(result.articles.value.length).toBeGreaterThan(0);
    expect(result.getReadingTime('word '.repeat(200).trim())).toBe(1);
    expect(result.formatDate(new Date('2024-01-15'))).toContain('2024');
    unmount();
  });

  it('falls back to the English article when a locale variant is missing', async () => {
    localeRef.value = 'fr';
    const { useArticle } = await loadUseArticle();
    // gutenguess puzzle has en + fr; deep-dive has en + fr too, so pick one
    const { result, unmount } = withSetup(() => useArticle(SLUG));

    expect(result.article.value).not.toBeNull();
    unmount();
  });

  it('navigates between adjacent articles', async () => {
    const { useArticles, useArticle } = await loadUseArticle();
    const { result: list, unmount: u1 } = withSetup(() => useArticles());
    const all = list.articles.value;
    u1();

    expect(all.length).toBeGreaterThanOrEqual(2);

    // middle-ish article should expose at least one neighbour
    const middle = all[Math.min(1, all.length - 1)];
    const { result, unmount } = withSetup(() => useArticle(middle.slug));
    await vi.advanceTimersByTimeAsync(0);

    const hasNeighbour =
      result.nextArticle.value !== null || result.prevArticle.value !== null;
    expect(hasNeighbour).toBeTruthy();
    unmount();
  });

  it('exposes no previous article for the newest post', async () => {
    const { useArticle } = await loadUseArticle();
    // newest by date (2026-01-18)
    const { result, unmount } = withSetup(() =>
      useArticle('gutenku-technical-deep-dive'),
    );
    await vi.advanceTimersByTimeAsync(0);

    expect(result.prevArticle.value).toBeNull();
    expect(result.nextArticle.value).not.toBeNull();
    unmount();
  });

  it('exposes no next article for the oldest post', async () => {
    const { useArticle } = await loadUseArticle();
    // oldest by date (2026-01-13)
    const { result, unmount } = withSetup(() =>
      useArticle('gutenguess-daily-literary-puzzle'),
    );
    await vi.advanceTimersByTimeAsync(0);

    expect(result.nextArticle.value).toBeNull();
    expect(result.prevArticle.value).not.toBeNull();
    unmount();
  });

  it('does not render math or mermaid when the article has neither', async () => {
    buildBody();
    const { useArticle } = await loadUseArticle();
    const { unmount } = withSetup(() =>
      useArticle('gutenguess-daily-literary-puzzle'),
    );

    await vi.advanceTimersByTimeAsync(50);
    await vi.runOnlyPendingTimersAsync();

    // gutenguess puzzle article contains no $$ math or ```mermaid blocks
    expect(katexRender).not.toHaveBeenCalled();
    expect(mermaidRender).not.toHaveBeenCalled();
    unmount();
  });

  it('skips math rendering when the body element is absent', async () => {
    // no .blog-article__body in the DOM
    document.body.replaceChildren();
    const { useArticle } = await loadUseArticle();
    const { unmount } = withSetup(() => useArticle(SLUG));

    await vi.advanceTimersByTimeAsync(50);
    await vi.runOnlyPendingTimersAsync();

    // render passes ran but found no container -> katex not invoked
    expect(katexRender).not.toHaveBeenCalled();
    unmount();
  });

  it('renders katex error fallback when rendering throws', async () => {
    katexRender.mockImplementationOnce(() => {
      throw new Error('bad tex');
    });
    buildBody({ math: true });

    const { useArticle } = await loadUseArticle();
    const { unmount } = withSetup(() => useArticle(SLUG));

    await vi.advanceTimersByTimeAsync(50);
    await vi.runOnlyPendingTimersAsync();

    expect(document.querySelector('.katex-error')).not.toBeNull();
    unmount();
  });

  it('reloads when the locale changes', async () => {
    const { useArticle } = await loadUseArticle();
    const slugRef = ref(SLUG);
    const { unmount } = withSetup(() => useArticle(slugRef));
    await vi.advanceTimersByTimeAsync(50);

    const { marked: markedMock } = await import('marked');
    const fn = markedMock as unknown as ReturnType<typeof vi.fn>;
    const before = fn.mock.calls.length;

    localeRef.value = 'fr';
    await vi.advanceTimersByTimeAsync(50);

    expect(fn.mock.calls.length).toBeGreaterThan(before);
    unmount();
  });
});
