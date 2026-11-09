import { bookmojiCatalogue } from './bookmoji-catalogue';

type Sheet = keyof typeof bookmojiCatalogue;
type Bookmoji = { id: string; glyph: string; sheet: Sheet };

const byGlyph = new Map<string, Bookmoji>();
const byId = new Map<string, Bookmoji>();

function normalizedGlyph(glyph: string): string {
  // Presentation selectors vary between stored emojis and incoming clues.
  return glyph.replaceAll(/[\uFE0E\uFE0F]/gu, '');
}

for (const sheet of Object.keys(bookmojiCatalogue) as Sheet[]) {
  for (const [id, glyph] of Object.entries(bookmojiCatalogue[sheet])) {
    const mark = { id, glyph, sheet };
    byGlyph.set(normalizedGlyph(glyph), mark);
    byId.set(id, mark);
  }
}

export function bookmojiForGlyph(glyph: string): Bookmoji | undefined {
  return byGlyph.get(normalizedGlyph(glyph));
}

export function bookmojiId(glyph: string): string | undefined {
  return bookmojiForGlyph(glyph)?.id;
}

export function bookmojiGlyph(id: string): string | undefined {
  return byId.get(id)?.glyph;
}
