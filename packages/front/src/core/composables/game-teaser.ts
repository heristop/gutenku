import { splitGraphemes } from '@/core/composables/graphemes';

// Today's GutenGuess clue, teased on the home page: only the emoji every
// player already sees for free, read from the game's stored puzzle (no
// request of its own).

type TeaserPuzzle = {
  date?: string;
  hints?: readonly { type: string; content: string }[];
} | null;

export function formatTeaser(
  emoticons: string | null,
  visible: number,
): string {
  if (!emoticons) {
    return '';
  }

  return splitGraphemes(emoticons)
    .filter((part) => part.trim())
    .slice(0, visible)
    .join(' ');
}

export function todaysFreeEmoji(
  puzzle: TeaserPuzzle | undefined,
  today: string,
): string | null {
  if (!puzzle || puzzle.date !== today) {
    return null;
  }

  return (
    puzzle.hints?.find((hint) => hint.type === 'emoticons')?.content ?? null
  );
}

export function playLabelKey(number: number | null, teaser: string): string {
  if (!number) {
    return 'home.hero.play';
  }

  return teaser ? 'home.hero.playNumberTeaser' : 'home.hero.playNumber';
}
