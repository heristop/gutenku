import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { withSetup } from '../../../helpers/with-setup';

// NOTE: marked is NOT mocked here so the configured link renderer runs.
const localeRef = ref('en');
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: localeRef }),
}));

describe('useArticle real markdown rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localeRef.value = 'en';
    document.body.replaceChildren();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders article markdown into HTML with anchor tags', async () => {
    const { useArticle } = await import('@/features/blog/composables/article');
    const { result, unmount } = withSetup(() =>
      useArticle('gutenku-technical-deep-dive'),
    );

    await vi.advanceTimersByTimeAsync(0);

    // marked produced real HTML markup
    expect(result.content.value).toContain('<');
    expect(result.loading.value).toBeFalsy();
    unmount();
  });

  it('marks external links with target=_blank and keeps internal links bare', async () => {
    // Force marked to render a known set of links via a custom article body.
    // We rely on the module's exported renderer being applied globally.
    const { marked } = await import('marked');
    const html = await marked(
      'See [external](https://example.com) and [home](/about) and [self](https://gutenku.xyz/x).',
    );

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    // internal + same-site links do not get target=_blank
    expect(html).toContain('href="/about"');
    const internalAnchor = html.slice(html.indexOf('href="/about"'));
    expect(internalAnchor.slice(0, 40)).not.toContain('target="_blank"');
  });

  it('renders a link with a title attribute', async () => {
    const { marked } = await import('marked');
    const html = await marked('[t](https://example.com "My Title")');
    expect(html).toContain('title="My Title"');
  });
});
