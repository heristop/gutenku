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

@injectable()
export class PuzzleService {
  constructor(
    @inject(IChapterRepositoryToken)
    private readonly chapterRepository: IChapterRepository,
    @inject(NaturalLanguageService)
    private readonly naturalLanguage: NaturalLanguageService,
  ) {}

  /**
   * Get emoticons for a date with specific visible count
   */
  getEmoticons(
    date: string,
    visibleCount: number,
  ): { emoticons: string; emoticonCount: number } {
    const book = selectDailyBook(date);
    const seed = dateToSeed(date);
    const random = seededRandom(seed);

    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const shuffled = shuffleEmoticons(book.emoticons, random);
    const allEmojis = [...segmenter.segment(shuffled)]
      .map((s) => s.segment)
      .filter((char) => char.trim());

    return {
      emoticons: allEmojis.slice(0, visibleCount).join(''),
      emoticonCount: allEmojis.length,
    };
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
   * Uses relaxed rules to allow more sentences from classic literature.
   */
  private isValidSentence(sentence: string): boolean {
    // Skip sentences with major formatting issues (brackets, quotes)
    if (/[@#[\]{}()"|"]/.test(sentence)) {
      return false;
    }
    // Skip sentences with numbers or special chars
    if (/[0-9*$%_~&]/.test(sentence)) {
      return false;
    }
    // Skip all-uppercase (chapter headers)
    if (/^[A-Z\s!:.?]+$/.test(sentence)) {
      return false;
    }
    // Allow longer sentences for puzzle hints (up to 50 chars)
    return sentence.length < 50;
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
