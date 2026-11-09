import { bookmojiGlyph } from '@gutenku/shared';
import { splitGraphemes } from './graphemes';

// Saved puzzles and haikus can still contain native emoji. New puzzle
// responses contain space-separated IDs, one per revealed tile.
export function readBookmoji(text: string): string[] {
  const value = text.trim();

  if (/^m[0-9a-f]{10}(?:\s|$)/.test(value)) {
    return value.split(/\s+/).map((id) => bookmojiGlyph(id) ?? '?');
  }

  return splitGraphemes(value).filter((glyph) => glyph.trim());
}
