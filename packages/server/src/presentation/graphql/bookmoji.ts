import { bookmojiId } from '@gutenku/shared';

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });

export function serializeBookmoji(text: string): string {
  const ids: string[] = [];

  for (const { segment } of segmenter.segment(text)) {
    if (!segment.trim()) {continue;}
    const id = bookmojiId(segment);

    if (!id) {throw new Error('Missing Bookmoji catalogue entry');}
    ids.push(id);
  }

  return ids.join(' ');
}
