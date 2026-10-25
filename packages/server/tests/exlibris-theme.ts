import { describe, expect, it } from 'vitest';
import type { HaikuValue } from '~/shared/types';
import exlibris, { dateLine, renderExLibris } from '~/shared/themes/exlibris';
import { createRng, hashSeed } from '~/shared/themes/exlibris-paper';

const haiku = {
  book: { title: 'Jane Eyre', author: 'Charlotte Brontë', reference: 'je' },
  chapter: { title: 'Chapter XII', content: '' },
  verses: [
    'the lamp burning low',
    "a stranger's name on the page",
    'rain against the glass',
  ],
  rawVerses: [],
  cacheUsed: false,
  title: 'Lamp and Rain',
} as HaikuValue;

const longHaiku = {
  ...haiku,
  book: {
    title:
      'The Life and Opinions of Tristram Shandy, Gentleman, Volume the Third and Last',
    author: 'Laurence Sterne, with a very long editorial attribution appended',
    reference: 'ts',
  },
  chapter: {
    title: 'CHAPTER THE TWENTY-SEVENTH, IN WHICH NOTHING HAPPENS AT ALL',
    content: '',
  },
  verses: [
    'and so the evening came upon the weary travellers at last, unhurried',
    'silence in the house of my uncle toby and the corporal and the dog',
    'a candle',
  ],
  title: undefined,
} as HaikuValue;

const date = new Date('2026-10-24T00:00:00Z');

function pngSize(buffer: Buffer): { width: number; height: number } {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

describe('exlibris theme', () => {
  const sizes: [string, number, number][] = [
    ['daily card source', 2000, 2500],
    ['daily card', 900, 1125],
    ['square social', 1080, 1080],
    ['portrait story', 1080, 1920],
  ];

  it.each(sizes)('renders the %s at %ix%i', (_label, width, height) => {
    const canvas = renderExLibris(haiku, { width, height, date });
    const png = canvas.toBuffer('image/png');
    const jpeg = canvas.toBuffer('image/jpeg');

    expect(pngSize(png)).toEqual({ width, height });
    expect(jpeg.subarray(0, 2).toString('hex')).toBe('ffd8');
  });

  it.each(sizes)(
    'handles long verses, titles and chapters at %s size',
    (_label, width, height) => {
      const canvas = renderExLibris(longHaiku, {
        width,
        height,
        mode: 'night',
        number: 1872,
      });

      expect(pngSize(canvas.toBuffer('image/png'))).toEqual({ width, height });
    },
  );

  it('renders a minimal haiku without book or chapter metadata', () => {
    const bare = {
      verses: ['a', 'b', 'c'],
      rawVerses: [],
      cacheUsed: false,
    } as unknown as HaikuValue;

    expect(() =>
      renderExLibris(bare, { width: 900, height: 1125 }),
    ).not.toThrow();
  });

  it('create() returns the full-size card', async () => {
    const canvas = await exlibris.create(haiku);

    expect(canvas.width).toBe(2000);
    expect(canvas.height).toBe(2500);
  });

  it('is deterministic for the same haiku and date', () => {
    const a = renderExLibris(haiku, { width: 450, height: 560, date });
    const b = renderExLibris(haiku, { width: 450, height: 560, date });

    expect(
      a.toBuffer('image/png').equals(b.toBuffer('image/png')),
    ).toBeTruthy();
  });

  it('prints a dark sheet in night mode', () => {
    const day = renderExLibris(haiku, { width: 300, height: 375, date });
    const night = renderExLibris(haiku, {
      width: 300,
      height: 375,
      date,
      mode: 'night',
    });
    const luminance = (c: ReturnType<typeof renderExLibris>) => {
      const [r, g, b] = c.getContext('2d').getImageData(5, 5, 1, 1).data;

      return (r + g + b) / 3;
    };

    expect(luminance(day)).toBeGreaterThan(200);
    expect(luminance(night)).toBeLessThan(60);
  });

  it('types the page date as weekday and day month', () => {
    expect(dateLine(new Date('2026-10-23T12:00:00Z'))).toBe(
      'Friday · 23 October',
    );
  });

  it('seeds a stable random sequence', () => {
    const a = createRng(hashSeed('gutenku'));
    const b = createRng(hashSeed('gutenku'));

    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});
