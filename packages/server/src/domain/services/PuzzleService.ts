import { inject, injectable } from 'tsyringe';
import { syllable } from 'syllable';
import { getGutenGuessBooks, type GutenGuessBook } from '~~/data';
import { getPuzzleNumber } from '@gutenku/shared';
import {
  type IChapterRepository,
  IChapterRepositoryToken,
} from '~/domain/repositories/IChapterRepository';
import NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import { cleanVerses } from '~/shared/helpers/HaikuHelper';
import { isValidPuzzleSentence } from '~/shared/constants/validation';

/**
 * Mulberry32 seeded PRNG for deterministic random selection
 */
export function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert date string to numeric seed
 */
export function dateToSeed(dateStr: string): number {
  if (!dateStr) {
    return 0;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  return year * 10000 + month * 100 + day;
}

/**
 * Fisher-Yates shuffle with seeded random
 */
export function shuffleWithSeed<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffle emoticons string deterministically using grapheme segmentation
 */
export function shuffleEmoticons(
  emoticons: string,
  random: () => number,
): string {
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const emojis = [...segmenter.segment(emoticons)].map((s) => s.segment);
  const shuffled = shuffleWithSeed(emojis, random);
  return shuffled.join('');
}

/**
 * Select book for the given date using cycle-based selection.
 */
export function selectDailyBook(dateStr: string): GutenGuessBook {
  const books = getGutenGuessBooks();
  const puzzleNumber = getPuzzleNumber(dateStr);

  const cycleNumber = Math.floor((puzzleNumber - 1) / books.length);
  const positionInCycle = (puzzleNumber - 1) % books.length;

  const cycleSeed = cycleNumber * 1_000_000 + 42;
  const random = seededRandom(cycleSeed);
  const shuffledBooks = shuffleWithSeed([...books], random);

  return shuffledBooks[positionInCycle];
}

function countSyllables(sentence: string): number {
  const words = sentence.toLowerCase().match(/[a-z]+/g);
  if (!words) {
    return 0;
  }
  return words.reduce((sum, word) => sum + syllable(word), 0);
}

/**
 * Create a shuffled array of indices 0 to total-1
 */
function shuffleIndices(random: () => number, total: number): number[] {
  const indices = Array.from({ length: total }, (_, i) => i);
  return shuffleWithSeed(indices, random);
}

/**
 * Get emoticons for a date with specific visible count and optional scratched positions.
 * This is a standalone function to ensure consistent shuffling
 * between initial puzzle load and emoticon reveal mutations.
 * Returns random visible indices for initial display (prevents cheating).
 *
 * @param date - The puzzle date
 * @param baseCount - Number of base visible emojis (picked randomly)
 * @param scratchedPositions - Additional positions to reveal (user-chosen)
 */
export function getEmoticonsByDate(
  date: string,
  baseCount: number,
  scratchedPositions: number[] = [],
): { emoticons: string; emoticonCount: number; visibleIndices: number[] } {
  const book = selectDailyBook(date);
  const seed = dateToSeed(date);
  // Use separate seed for emoticons to ensure consistent shuffling
  // regardless of how many random values were consumed elsewhere
  const emoticonRandom = seededRandom(seed + 1000);

  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const shuffled = shuffleEmoticons(book.emoticons, emoticonRandom);
  const allEmojis = [...segmenter.segment(shuffled)]
    .map((s) => s.segment)
    .filter((char) => char.trim());

  // Create a deterministic shuffled order of all indices (use seed + 2000)
  const indexRandom = seededRandom(seed + 2000);
  const shuffledIndices = shuffleIndices(indexRandom, allEmojis.length);

  // Take first baseCount indices in their shuffled order (ensures consistency when baseCount grows)
  const baseIndices = shuffledIndices.slice(0, baseCount);

  // Sort for visibleIndices return value (display purposes)
  const sortedBaseIndices = [...baseIndices].sort((a, b) => a - b);

  // Sort scratched positions and filter out any that are already in base
  const validScratched = scratchedPositions
    .filter(
      (pos) =>
        !sortedBaseIndices.includes(pos) && pos >= 0 && pos < allEmojis.length,
    )
    .sort((a, b) => a - b);

  // Build emoticons string: base emojis in shuffled order, then scratched emojis (sorted)
  const baseEmojis = baseIndices.map((i) => allEmojis[i]).join('');
  const scratchedEmojis = validScratched.map((i) => allEmojis[i]).join('');

  return {
    emoticons: baseEmojis + scratchedEmojis,
    emoticonCount: allEmojis.length,
    visibleIndices: sortedBaseIndices, // Only base indices, not scratched
  };
}

@injectable()
export class PuzzleService {
  constructor(
    @inject(IChapterRepositoryToken)
    private readonly chapterRepository: IChapterRepository,
    @inject(NaturalLanguageService)
    private readonly naturalLanguage: NaturalLanguageService,
  ) {}

  /**
   * Get emoticons for a date with specific visible count and scratched positions
   */
  getEmoticons(
    date: string,
    baseCount: number,
    scratchedPositions: number[] = [],
  ): { emoticons: string; emoticonCount: number; visibleIndices: number[] } {
    return getEmoticonsByDate(date, baseCount, scratchedPositions);
  }

  /**
   * Get a specific haiku by index for a date
   */
  async getHaiku(date: string, index: number): Promise<string | null> {
    const book = selectDailyBook(date);
    const seed = dateToSeed(date);
    const random = seededRandom(seed);

    const haikus = await this.generateHaikus(book, index + 1, random);
    return haikus[index] ?? null;
  }

  /**
   * Check if a sentence is valid for puzzle haiku hints.
   */
  private isValidSentence(sentence: string): boolean {
    return isValidPuzzleSentence(sentence, 50);
  }

  private categorizeSentences(chapters: { content: string }[]): {
    fiveSyllable: string[];
    sevenSyllable: string[];
  } {
    const fiveSyllable: string[] = [];
    const sevenSyllable: string[] = [];

    for (const chapter of chapters) {
      const sentences = this.naturalLanguage.extractSentencesByPunctuation(
        chapter.content,
      );

      for (const sentence of sentences) {
        if (!this.isValidSentence(sentence)) {
          continue;
        }

        const syllableCount = countSyllables(sentence);

        if (syllableCount === 5) {
          fiveSyllable.push(sentence);
        }

        if (syllableCount === 7) {
          sevenSyllable.push(sentence);
        }
      }
    }

    return { fiveSyllable, sevenSyllable };
  }

  private async generateHaikus(
    book: GutenGuessBook,
    count: number,
    random: () => number,
  ): Promise<string[]> {
    try {
      const chapters = await this.chapterRepository.getChaptersByBookReference(
        book.id.toString(),
      );

      if (chapters.length === 0) {
        return [];
      }

      const { fiveSyllable, sevenSyllable } =
        this.categorizeSentences(chapters);

      if (fiveSyllable.length < 2 || sevenSyllable.length < 1) {
        return [];
      }

      const haikus: string[] = [];
      const usedFive = new Set<string>();
      const usedSeven = new Set<string>();
      const pick = (arr: string[]) => arr[Math.floor(random() * arr.length)];

      for (let i = 0; i < count; i++) {
        const availableFive = fiveSyllable.filter((s) => !usedFive.has(s));
        const availableSeven = sevenSyllable.filter((s) => !usedSeven.has(s));

        if (availableFive.length < 2 || availableSeven.length < 1) {
          break;
        }

        const v1 = pick(availableFive);
        usedFive.add(v1);

        const v2 = pick(availableSeven);
        usedSeven.add(v2);

        const remainingFive = availableFive.filter((s) => s !== v1);
        const v3 =
          remainingFive.length > 0 ? pick(remainingFive) : pick(availableFive);
        usedFive.add(v3);

        const cleaned = cleanVerses([v1, v2, v3]);
        haikus.push(cleaned.join('\n'));
      }

      return haikus;
    } catch {
      return [];
    }
  }
}
