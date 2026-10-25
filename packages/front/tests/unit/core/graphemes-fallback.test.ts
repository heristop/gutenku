import { afterEach, describe, expect, it, vi } from 'vitest';

// Firefox ESR 115 and older Safari ship no Intl.Segmenter: the helpers that
// count graphemes must still load (the home page imports them) and count
const segmenter = Intl.Segmenter;

describe('grapheme helpers without Intl.Segmenter', () => {
  afterEach(() => {
    Object.defineProperty(Intl, 'Segmenter', {
      value: segmenter,
      configurable: true,
      writable: true,
    });
    vi.resetModules();
  });

  it('still load and count', async () => {
    Object.defineProperty(Intl, 'Segmenter', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    vi.resetModules();

    const { formatTeaser } = await import('@/core/composables/game-teaser');
    const { longestVerseLength } =
      await import('@/features/haiku/composables/verse-fit');

    expect(formatTeaser('🎩🔧📜', 2)).toBe('🎩 🔧');
    expect(longestVerseLength(['the night', 'like snow in the sun'])).toBe(20);
  });
});
