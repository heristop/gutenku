import { describe, expect, it } from 'vitest';
import { resolvePostTheme } from '~/cli/post-haiku-helpers';

describe('post-haiku theme', () => {
  it('draws only guess-safe themes for random', () => {
    const drawn = new Set(
      [0, 0.3, 0.6, 0.99].map((r) =>
        resolvePostTheme('random', false, () => r),
      ),
    );

    expect([...drawn].sort()).toEqual(['greentea', 'watermark']);
  });

  it('adds sumie to the draw when AI images are allowed', () => {
    const drawn = new Set(
      [0, 0.4, 0.99].map((r) => resolvePostTheme(undefined, true, () => r)),
    );

    expect([...drawn].sort()).toEqual(['greentea', 'sumie', 'watermark']);
  });

  it('keeps a named guess-safe theme', () => {
    expect(resolvePostTheme('watermark', false)).toBe('watermark');
    expect(resolvePostTheme('sumie', false)).toBe('sumie');
  });

  it.each(['catalogue', 'exlibris', 'frontispiece', 'ukiyoe'])(
    'refuses %s, which would give the answer away or is not allowed',
    (theme) => {
      expect(() => resolvePostTheme(theme, true)).toThrow(
        /give the answer away/,
      );
    },
  );
});
