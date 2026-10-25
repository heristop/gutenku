import { describe, expect, it } from 'vitest';
import { buildVerseExcerpt } from '~/domain/services/verse-excerpt';

const CHAPTER = `It was early.  The sun rose over the hills and the golden
marvel of the morning lay on the water. Many a man longeth thy smiling for
tears, said the old woman, turning back. Far off the spontaneous bark of a dog
broke the silence of the valley.`;

describe('buildVerseExcerpt', () => {
  it('cuts the words around each verse, joined in poem order', () => {
    const excerpt = buildVerseExcerpt(CHAPTER, [
      'golden marvel',
      'longeth thy smiling for tears',
      'the spontaneous bark',
    ]);

    expect(excerpt?.verses).toEqual([
      'golden marvel',
      'longeth thy smiling for tears',
      'the spontaneous bark',
    ]);
    expect(excerpt?.text.split(' … ')).toHaveLength(3);
    // Whole words only, whitespace folded
    expect(excerpt?.text).toContain('the golden marvel of the');
    expect(excerpt?.text).not.toMatch(/\s{2}|\n/);

    for (const verse of excerpt?.verses ?? []) {
      expect(excerpt?.text).toContain(verse);
    }
  });

  it('keeps the case the chapter has', () => {
    const excerpt = buildVerseExcerpt('Then THE GOLDEN marvel shone.', [
      'the golden marvel',
    ]);

    expect(excerpt?.verses).toEqual(['THE GOLDEN marvel']);
  });

  it('gives nothing when a verse is not in the chapter', () => {
    expect(buildVerseExcerpt(CHAPTER, ['golden marvel', 'absent line'])).toBe(
      null,
    );
    expect(buildVerseExcerpt('', ['golden marvel'])).toBe(null);
    expect(buildVerseExcerpt(CHAPTER, [])).toBe(null);
  });
});
