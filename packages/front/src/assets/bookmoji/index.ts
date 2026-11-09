import { bookmojiForGlyph } from '@gutenku/shared';
import animals from './bookmoji-animals.svg?no-inline';
import objects from './bookmoji-objects.svg?no-inline';
import nature from './bookmoji-nature.svg?no-inline';
import figures from './bookmoji-figures.svg?no-inline';
import signs from './bookmoji-signs.svg?no-inline';
import flags from './bookmoji-flags.svg?no-inline';
import reserve from './bookmoji-reserve.svg?no-inline';

const sheets = { animals, objects, nature, figures, signs, flags, reserve };

export function bookmojiUrl(glyph: string): string | undefined {
  const mark = bookmojiForGlyph(glyph);

  return mark ? `${sheets[mark.sheet]}#${mark.id}` : undefined;
}
