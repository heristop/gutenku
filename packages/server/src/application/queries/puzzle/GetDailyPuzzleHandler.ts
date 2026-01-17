import { inject, injectable } from 'tsyringe';
import { syllable } from 'syllable';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { GetDailyPuzzleQuery } from './GetDailyPuzzleQuery';
import {
  getPuzzleNumber,
  type DailyPuzzleResponse,
  type PuzzleHint,
  type BookValue,
} from '@gutenku/shared';
import { getGutenGuessBooks, type GutenGuessBook } from '~~/data';
import {
  type IChapterRepository,
  IChapterRepositoryToken,
} from '~/domain/repositories/IChapterRepository';
import NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';
import type { VerseCandidate } from '~/domain/services/genetic/types';
import { getEmoticonsByDate } from '~/domain/services/PuzzleService';
import { cleanVerses } from '~/shared/helpers/HaikuHelper';
import { dailyPuzzleSchema } from '~/infrastructure/validation/schemas';
import { HINT_POOL, type HintLocale } from './hint-pool';
import { isValidPuzzleSentence } from '~/shared/constants/validation';

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
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert date string to numeric seed
 */
function dateToSeed(dateStr: string): number {
  if (!dateStr) {
    return 0;
  }
  const [year, month, day] = dateStr.split('-').map(Number);

  return year * 10000 + month * 100 + day;
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
 * Generate 6 hints for the book: emoticons (round 1) + 5 randomly selected hints from pool.
 * Excludes era/publication_century pairs. Sorts by difficulty. Uses seeded PRNG.
 */
function generateHints(
  book: GutenGuessBook,
  random: () => number,
  locale: HintLocale = 'en',
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
      content: hintDef.generator(book, random, locale),
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
 * Return up to SELECTABLE_BOOKS_LIMIT books for autocomplete, ensuring correct book is included.
 * Shuffled deterministically by date. Returns localized titles.
 */
function getAvailableBooks(
  correctBook: GutenGuessBook,
  dateStr: string,
  locale: HintLocale = 'en',
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
    title: book.title[locale] || book.title.en,
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
    @inject(MarkovEvaluatorService)
    private readonly markovEvaluator: MarkovEvaluatorService,
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

    // Get locale from query, default to 'en', validate it's a supported locale
    const locale = (
      ['en', 'fr', 'ja'].includes(query.locale) ? query.locale : 'en'
    ) as HintLocale;

    // Create seeded PRNG for deterministic results
    const seed = dateToSeed(date);
    const random = seededRandom(seed);

    // Select today's book deterministically
    const book = selectDailyBook(date);

    // Generate all hints (uses seeded random for quote selection)
    const allHints = generateHints(book, random, locale);

    // Filter hints based on revealed rounds (for progressive reveal)
    const hints = allHints.filter(
      (hint) => revealedRounds.includes(hint.round) || hint.round === 1,
    );

    // Get emoticons using single source of truth (getEmoticonsByDate)
    // Keeps initial load and reveal mutations in sync
    const { emoticons, emoticonCount, visibleIndices } = getEmoticonsByDate(
      date,
      visibleEmoticonCount,
    );

    // Update emoticon hint content with shuffled and sliced emoticons
    for (const hint of hints) {
      if (hint.type === 'emoticons') {
        hint.content = emoticons;
      }
    }

    // Generate multiple haikus using GA for lifeline system (max 3) - deterministic
    const allHaikus = await this.generateHaikus(book, date);
    // Only return revealed haikus (client reveals them progressively)
    const haikus = allHaikus.slice(0, revealedHaikuCount);

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
        visibleIndices,
        nextPuzzleAvailableAt: tomorrow.toISOString(),
      },
      availableBooks: getAvailableBooks(book, date, locale),
    };
  }

  /**
   * Check if a sentence is valid for puzzle haiku hints.
   */
  private isValidSentence(sentence: string): boolean {
    return isValidPuzzleSentence(sentence, 50);
  }

  /**
   * Categorize sentences by syllable count (5 or 7) into VerseCandidate format.
   */
  private categorizeSentences(chapters: { content: string }[]): {
    fiveSyllable: VerseCandidate[];
    sevenSyllable: VerseCandidate[];
  } {
    const fiveSyllable: VerseCandidate[] = [];
    const sevenSyllable: VerseCandidate[] = [];
    let sourceIndex = 0;

    for (const chapter of chapters) {
      const sentences = this.naturalLanguage.extractSentencesByPunctuation(
        chapter.content,
      );

      for (const sentence of sentences) {
        if (!this.isValidSentence(sentence)) {
          sourceIndex++;
          continue;
        }

        const syllableCount = countSyllables(sentence);

        if (syllableCount === 5) {
          fiveSyllable.push({
            text: sentence,
            syllableCount: 5,
            sourceIndex,
          });
        }

        if (syllableCount === 7) {
          sevenSyllable.push({
            text: sentence,
            syllableCount: 7,
            sourceIndex,
          });
        }

        sourceIndex++;
      }
    }

    return { fiveSyllable, sevenSyllable };
  }

  /**
   * Score a verse using Markov chain fluency evaluation.
   */
  private scoreVerse(verse: VerseCandidate): number {
    // Use the Markov evaluator to score fluency based on word transitions
    const words = verse.text.toLowerCase().split(/\s+/);
    if (words.length < 2) {
      return 0;
    }
    // Evaluate as a single-verse "haiku" to get transition score
    return this.markovEvaluator.evaluateHaiku(words);
  }

  /**
   * Generate haikus using quality-scored random selection from verse pools.
   * Uses date-based seed for deterministic results (same haikus for everyone on same day).
   * Verses are scored by Markov fluency and top candidates are selected with seeded randomization.
   */
  private async generateHaikus(
    book: GutenGuessBook,
    date: string,
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

      // Check minimum pool sizes (need at least 6 five-syllable verses for 3 haikus)
      if (fiveSyllable.length < 6 || sevenSyllable.length < 3) {
        return [];
      }

      // Score all verses for quality
      const scoredFive = fiveSyllable.map((v) => ({
        ...v,
        score: this.scoreVerse(v),
      }));
      const scoredSeven = sevenSyllable.map((v) => ({
        ...v,
        score: this.scoreVerse(v),
      }));

      // Sort by score descending
      scoredFive.sort((a, b) => b.score - a.score);
      scoredSeven.sort((a, b) => b.score - a.score);

      // Take top tier candidates (top 30% or minimum 10)
      const topFiveCount = Math.max(10, Math.floor(scoredFive.length * 0.3));
      const topSevenCount = Math.max(5, Math.floor(scoredSeven.length * 0.3));
      const topFive = scoredFive.slice(0, topFiveCount);
      const topSeven = scoredSeven.slice(0, topSevenCount);

      // Create seeded PRNG for deterministic random selection from top tier
      const seed = dateToSeed(date);
      const randomFn = seededRandom(seed);

      // Shuffle top candidates for variety while maintaining quality
      const shuffledFive = shuffleWithSeed([...topFive], randomFn);
      const shuffledSeven = shuffleWithSeed([...topSeven], randomFn);

      // Generate 3 haikus (5-7-5 structure)
      const haikus: string[] = [];
      for (let i = 0; i < 3; i++) {
        const line1 = shuffledFive[i * 2].text; // 5 syllables
        const line2 = shuffledSeven[i].text; // 7 syllables
        const line3 = shuffledFive[i * 2 + 1].text; // 5 syllables

        const cleaned = cleanVerses([line1, line2, line3]);
        haikus.push(cleaned.join('\n'));
      }

      return haikus;
    } catch {
      return [];
    }
  }
}
