import { describe, expect, it } from 'vitest';
import { getVerseContext } from '@/features/haiku/composables/verse-sources';

describe('getVerseContext', () => {
  const chapter =
    'It was a dark night. The lamp burning low on the table cast long shadows across the room.';

  it('returns the words around a verse, snapped to word boundaries', () => {
    const ctx = getVerseContext(chapter, 'the lamp burning low', 12);

    expect(ctx?.match).toBe('The lamp burning low');
    expect(ctx?.before).toBe('night. ');
    expect(ctx?.after).toBe(' on the');
    expect(ctx?.clippedStart).toBeTruthy();
    expect(ctx?.clippedEnd).toBeTruthy();
  });

  it('collapses whitespace in the chapter and the verse', () => {
    const ctx = getVerseContext('a\n\nlamp   burning', 'lamp burning');

    expect(ctx?.match).toBe('lamp burning');
    expect(ctx?.clippedStart).toBeFalsy();
    expect(ctx?.clippedEnd).toBeFalsy();
  });

  it('returns null when the verse is missing', () => {
    expect(getVerseContext(chapter, 'rain against the glass')).toBeNull();
    expect(getVerseContext('', 'x')).toBeNull();
  });
});
