import { describe, expect, it } from 'vitest';
import {
  formatTeaser,
  playLabelKey,
  todaysFreeEmoji,
} from '@/core/composables/game-teaser';

describe('formatTeaser', () => {
  it('keeps the first visible emoji, spaced', () => {
    expect(formatTeaser('⚖️✝️🏛️', 2)).toBe('⚖️ ✝️');
  });

  it('is empty without emoji', () => {
    expect(formatTeaser(null, 2)).toBe('');
    expect(formatTeaser('', 2)).toBe('');
  });
});

describe('playLabelKey', () => {
  it('names the teaser only when there is one', () => {
    expect(playLabelKey(298, '⚖️ ✝️')).toBe('home.hero.playNumberTeaser');
    expect(playLabelKey(298, '')).toBe('home.hero.playNumber');
    expect(playLabelKey(null, '⚖️ ✝️')).toBe('home.hero.play');
  });
});

describe('todaysFreeEmoji', () => {
  const puzzle = (date: string) => ({
    date,
    hints: [
      { type: 'genre', content: 'Drama' },
      { type: 'emoticons', content: '⚖️✝️' },
    ],
  });

  it("reads today's emoji clue", () => {
    expect(todaysFreeEmoji(puzzle('2026-10-25'), '2026-10-25')).toBe('⚖️✝️');
  });

  it("ignores another day's puzzle", () => {
    expect(todaysFreeEmoji(puzzle('2026-10-24'), '2026-10-25')).toBe(null);
    expect(todaysFreeEmoji(null, '2026-10-25')).toBe(null);
  });
});
