import { inject, injectable } from 'tsyringe';
import { syllable } from 'syllable';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { GetDailyPuzzleQuery } from './GetDailyPuzzleQuery';
import type {
  DailyPuzzleResponse,
  PuzzleHint,
  BookValue,
} from '@gutenku/shared';
import { getGutenGuessBooks, type GutenGuessBook } from '~~/data';
import {
  type IChapterRepository,
  IChapterRepositoryToken,
} from '~/domain/repositories/IChapterRepository';
import NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import { cleanVerses } from '~/shared/helpers/HaikuHelper';
import { dailyPuzzleSchema } from '~/infrastructure/validation/schemas';

// Launch date for puzzle numbering (adjust as needed)
const LAUNCH_DATE = new Date('2026-01-01');

// Limit the number of books shown in the selection dropdown
const SELECTABLE_BOOKS_LIMIT = 50;

/**
 * Mulberry32 seeded PRNG for deterministic random selection
 */
function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    // eslint-disable-next-line unicorn/prefer-math-trunc -- >>> 0 converts to unsigned 32-bit int
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert date string to numeric seed
 */
function dateToSeed(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return year * 10000 + month * 100 + day;
}

/**
 * Calculate puzzle number (days since launch)
 */
function getPuzzleNumber(dateStr: string): number {
  const date = new Date(dateStr);
  const diffTime = date.getTime() - LAUNCH_DATE.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Select book for the given date using cycle-based selection.
 * Each cycle reshuffles the book list.
 */
function selectDailyBook(dateStr: string): GutenGuessBook {
  const books = getGutenGuessBooks();
  const puzzleNumber = getPuzzleNumber(dateStr);

  // Determine which cycle we're in (each cycle = N books)
  const cycleNumber = Math.floor((puzzleNumber - 1) / books.length);
  const positionInCycle = (puzzleNumber - 1) % books.length;

  // Shuffle books deterministically for this cycle
  const cycleSeed = cycleNumber * 1_000_000 + 42;
  const random = seededRandom(cycleSeed);
  const shuffledBooks = shuffleWithSeed([...books], random);

  return shuffledBooks[positionInCycle];
}

/**
 * Hint pool with difficulty ratings (lower = revealed earlier, higher = more revealing).
 */
interface HintDefinition {
  type: PuzzleHint['type'];
  difficulty: number;
  generator: (book: GutenGuessBook, random: () => number) => string;
}

const HINT_POOL: HintDefinition[] = [
  {
    type: 'title_word_count',
    difficulty: 2,
    generator: (book) => {
      const count = book.title.split(/\s+/).length;
      return `${count} word${count !== 1 ? 's' : ''}`;
    },
  },
  {
    type: 'genre',
    difficulty: 3,
    generator: (book) => book.genre,
  },
  {
    type: 'era',
    difficulty: 3,
    generator: (book) => book.era,
  },
  {
    type: 'protagonist',
    difficulty: 4,
    generator: (book) => book.protagonist,
  },
  {
    type: 'publication_century',
    difficulty: 4,
    generator: (book) => {
      const century = Math.floor(book.publicationYear / 100) + 1;
      const suffixes: Record<number, string> = { 21: 'st', 22: 'nd', 23: 'rd' };
      const suffix = suffixes[century] || 'th';
      return `Published in the ${century}${suffix} century`;
    },
  },
  {
    type: 'setting',
    difficulty: 5,
    generator: (book) => book.setting,
  },
  {
    type: 'quote',
    difficulty: 6,
    generator: (book, random) => {
      const quoteIndex = Math.floor(random() * book.notableQuotes.length);
      return (
        book.notableQuotes[quoteIndex] || 'A famous quote from this book...'
      );
    },
  },
  {
    type: 'first_letter',
    difficulty: 7,
    generator: (book) => `${book.title[0].toUpperCase()}...`,
  },
  {
    type: 'author_nationality',
    difficulty: 8,
    generator: (book) => book.authorNationality,
  },
  {
    type: 'author_name',
    difficulty: 10,
    generator: (book) => book.author.split(' ')[0],
  },
];

/**
 * Generate 6 hints for the book: emoticons (round 1) + 5 randomly selected hints from pool.
 * Excludes era/publication_century pairs. Sorts by difficulty. Uses seeded PRNG.
 */
function generateHints(
  book: GutenGuessBook,
  random: () => number,
): PuzzleHint[] {
  // Round 1: Always emoticons (shuffled separately)
  const hints: PuzzleHint[] = [
    {
      round: 1,
      type: 'emoticons',
      content: book.emoticons,
    },
  ];

  // Shuffle the hint pool and select 5
  const shuffledPool = shuffleWithSeed([...HINT_POOL], random);
  const selectedHints = shuffledPool.slice(0, 5);

  // Exclusion rule: era and publication_century cannot both appear
  const hasEra = selectedHints.some((h) => h.type === 'era');
  const hasCentury = selectedHints.some(
    (h) => h.type === 'publication_century',
  );

  if (hasEra && hasCentury) {
    // Remove era and find a replacement from remaining pool
    const eraIndex = selectedHints.findIndex((h) => h.type === 'era');
    const remaining = shuffledPool.slice(5);
    const replacement = remaining.find(
      (h) => h.type !== 'era' && h.type !== 'publication_century',
    );
    if (replacement) {
      selectedHints[eraIndex] = replacement;
    }
  }

  // Sort by difficulty (ascending = harder hints first, easier hints later)
  selectedHints.sort((a, b) => a.difficulty - b.difficulty);

  // Generate content for each selected hint and assign rounds 2-6
  for (let i = 0; i < selectedHints.length; i++) {
    const hintDef = selectedHints[i];
    hints.push({
      round: i + 2,
      type: hintDef.type,
      content: hintDef.generator(book, random),
    });
  }

  return hints;
}

/**
 * Fisher-Yates shuffle with seeded random
 */
function shuffleWithSeed<T>(array: T[], random: () => number): T[] {
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
function shuffleEmoticons(emoticons: string, random: () => number): string {
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const emojis = [...segmenter.segment(emoticons)].map((s) => s.segment);
  const shuffled = shuffleWithSeed(emojis, random);
  return shuffled.join('');
}

/**
 * Return up to SELECTABLE_BOOKS_LIMIT books for autocomplete, ensuring correct book is included.
 * Shuffled deterministically by date.
 */
function getAvailableBooks(
  correctBook: GutenGuessBook,
  dateStr: string,
): BookValue[] {
  const allBooks = getGutenGuessBooks();

  // Take first N books as the base selection
  let selectedBooks = allBooks.slice(0, SELECTABLE_BOOKS_LIMIT);

  // Check if the correct book is in the selection
  const correctInSelection = selectedBooks.some((b) => b.id === correctBook.id);

  if (!correctInSelection) {
    // Swap in the correct book for the last one
    selectedBooks[SELECTABLE_BOOKS_LIMIT - 1] = correctBook;
  }

  // Shuffle with date seed so order varies but is deterministic per day
  const seed = dateToSeed(dateStr);
  const random = seededRandom(seed);
  selectedBooks = shuffleWithSeed(selectedBooks, random);

  return selectedBooks.map((book) => ({
    reference: book.id.toString(),
    title: book.title,
    author: book.author,
  }));
}

/**
 * Count syllables in a sentence
 */
function countSyllables(sentence: string): number {
  const words = sentence.toLowerCase().match(/[a-z]+/g);
  if (!words) {
    return 0;
  }
  return words.reduce((sum, word) => sum + syllable(word), 0);
}

@injectable()
export class GetDailyPuzzleHandler implements IQueryHandler<
  GetDailyPuzzleQuery,
  DailyPuzzleResponse
> {
  constructor(
    @inject(IChapterRepositoryToken)
    private readonly chapterRepository: IChapterRepository,
    @inject(NaturalLanguageService)
    private readonly naturalLanguage: NaturalLanguageService,
  ) {}

  async execute(query: GetDailyPuzzleQuery): Promise<DailyPuzzleResponse> {
    // Validate input parameters
    const validated = dailyPuzzleSchema.parse({
      date: query.date,
      revealedRounds: query.revealedRounds,
      visibleEmoticonCount: query.visibleEmoticonCount,
      revealedHaikuCount: query.revealedHaikuCount,
    });

    const {
      date,
      revealedRounds,
      visibleEmoticonCount = 2,
      revealedHaikuCount = 0,
    } = validated;

    // Create seeded PRNG for deterministic results
    const seed = dateToSeed(date);
    const random = seededRandom(seed);

    // Select today's book deterministically
    const book = selectDailyBook(date);

    // Generate all hints (uses seeded random for quote selection)
    const allHints = generateHints(book, random);

    // Filter hints based on revealed rounds (for progressive reveal)
    const hints = allHints.filter(
      (hint) => revealedRounds.includes(hint.round) || hint.round === 1,
    );

    // Shuffle emoticons deterministically and limit to visibleEmoticonCount
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    for (const hint of hints) {
      if (hint.type === 'emoticons') {
        const shuffled = shuffleEmoticons(hint.content, random);
        // Slice to only show visibleEmoticonCount emoticons
        const allEmojis = [...segmenter.segment(shuffled)]
          .map((s) => s.segment)
          .filter((char) => char.trim());
        hint.content = allEmojis.slice(0, visibleEmoticonCount).join('');
      }
    }

    // Generate multiple haikus for lifeline system (max 3) - deterministic
    const allHaikus = await this.generateHaikus(book, 3, random);
    // Only return revealed haikus (client reveals them progressively)
    const haikus = allHaikus.slice(0, revealedHaikuCount);

    // Count emoticons using grapheme segmentation (reuse segmenter from above)
    const emoticonCount = [...segmenter.segment(book.emoticons)]
      .map((s) => s.segment)
      .filter((char) => char.trim()).length;

    // Calculate next puzzle availability (next midnight UTC)
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    return {
      puzzle: {
        date,
        puzzleNumber: getPuzzleNumber(date),
        hints,
        haikus,
        emoticonCount,
        nextPuzzleAvailableAt: tomorrow.toISOString(),
      },
      availableBooks: getAvailableBooks(book, date),
    };
  }

  /**
   * Check if a sentence is valid for haiku use.
   */
  private isValidSentence(sentence: string): boolean {
    if (this.naturalLanguage.hasUpperCaseWords(sentence)) {
      return false;
    }
    if (this.naturalLanguage.hasBlacklistedCharsInQuote(sentence)) {
      return false;
    }
    return sentence.length < 30;
  }

  /**
   * Categorize sentences by syllable count (5 or 7).
   */
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
        } else if (syllableCount === 7) {
          sevenSyllable.push(sentence);
        }
      }
    }

    return { fiveSyllable, sevenSyllable };
  }

  /**
   * Generate haikus from chapter sentences matching 5-7-5 syllable pattern.
   * Validates sentences using NaturalLanguageService rules. Uses seeded PRNG.
   */
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
