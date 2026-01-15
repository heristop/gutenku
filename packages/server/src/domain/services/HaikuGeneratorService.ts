/* eslint-disable max-lines */
import { promisify } from 'node:util';
import { createLogger } from '~/infrastructure/services/Logger';
import { unlink } from 'node:fs';
import { syllable } from 'syllable';
import { singleton, inject } from 'tsyringe';
import type {
  BookValue,
  BookValueWithChapters,
  ChapterValue,
  ChapterWithBook,
  ExtractionMethod,
  HaikuValue,
} from '~/shared/types';
import { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';
import NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import { HaikuValidatorService } from '~/domain/services/HaikuValidatorService';
import {
  type ICanvasService,
  ICanvasServiceToken,
} from '~/domain/services/ICanvasService';
import type { IGenerator } from '~/domain/interfaces/IGenerator';
import type { IHaikuRepository } from '~/domain/repositories/IHaikuRepository';
import type { IChapterRepository } from '~/domain/repositories/IChapterRepository';
import type { IBookRepository } from '~/domain/repositories/IBookRepository';
import {
  extractContextVerses,
  cleanVerses,
} from '~/shared/helpers/HaikuHelper';
import { MaxAttemptsException } from '~/domain/exceptions';
import {
  calculateHaikuQuality,
  MIN_QUOTES_THRESHOLD,
  DEFAULT_SENTIMENT_MIN_SCORE,
  DEFAULT_MARKOV_MIN_SCORE,
  DEFAULT_GRAMMAR_MIN_SCORE,
  DEFAULT_TRIGRAM_MIN_SCORE,
  DEFAULT_UNIQUENESS_MIN_SCORE,
  DEFAULT_ALLITERATION_MIN_SCORE,
  DEFAULT_VERSE_DISTANCE_MIN_SCORE,
  DEFAULT_LINE_BALANCE_MIN_SCORE,
  DEFAULT_IMAGERY_MIN_SCORE,
  DEFAULT_COHERENCE_MIN_SCORE,
  DEFAULT_VERB_MIN_SCORE,
  type QualityMetrics,
} from '~/shared/constants/validation';
import type {
  CacheConfig,
  ScoreConfig,
  GeneratorConfig,
  ScoreThresholds,
  QuoteCandidate,
  RejectionStats,
} from './HaikuGeneratorTypes';
import type { VersePools, VerseCandidate } from './genetic/types';

const log = createLogger('haiku');

@singleton()
export default class HaikuGeneratorService implements IGenerator {
  private static readonly DEFAULT_CONFIG: GeneratorConfig = {
    cache: { minCachedDocs: 100, ttl: 0, enabled: false },
    score: {
      sentiment: null,
      markovChain: null,
      pos: null,
      trigram: null,
      tfidf: null,
      phonetics: null,
      uniqueness: null,
      verseDistance: null,
      lineLengthBalance: null,
      imageryDensity: null,
      semanticCoherence: null,
      verbPresence: null,
    },
    theme: 'random',
  };

  private readonly maxAttempts = 500;
  private readonly maxAttemptsInBook = 50;
  private readonly chunkSize = 10;
  private readonly bookPoolSize = 10;

  private minCachedDocs: number;
  private ttl: number;
  private useCache: boolean;
  private theme: string;
  private executionTime: number;
  private filterWords: string[];
  private filterWordsRegex: RegExp | null = null;
  private filterWordsKey: string | null = null;
  private sentimentMinScore: number | null;
  private markovMinScore: number | null;
  private posMinScore: number | null;
  private trigramMinScore: number | null;
  private tfidfMinScore: number | null;
  private phoneticsMinScore: number | null;
  private uniquenessMinScore: number | null;

  private bookPool: BookValueWithChapters[] = [];
  private cachedThresholds: ScoreThresholds | null = null;
  private lastExtractionMethod: ExtractionMethod = 'punctuation';
  private forcedExtractionMethod: 'punctuation' | 'chunk' | null = null;
  private validator: HaikuValidatorService;

  constructor(
    @inject('IHaikuRepository')
    private readonly haikuRepository: IHaikuRepository,
    @inject('IChapterRepository')
    private readonly chapterRepository: IChapterRepository,
    @inject('IBookRepository') private readonly bookRepository: IBookRepository,
    @inject(MarkovEvaluatorService)
    private readonly markovEvaluator: MarkovEvaluatorService,
    @inject(NaturalLanguageService)
    private readonly naturalLanguage: NaturalLanguageService,
    @inject(ICanvasServiceToken)
    private readonly canvasService: ICanvasService,
  ) {
    this.filterWords = [];
    this.validator = new HaikuValidatorService(
      naturalLanguage,
      markovEvaluator,
    );
  }

  configure(options?: Partial<GeneratorConfig>): HaikuGeneratorService {
    const defaults = HaikuGeneratorService.DEFAULT_CONFIG;
    const cache = { ...defaults.cache, ...options?.cache };
    const score = { ...defaults.score, ...options?.score };

    this.applyCacheConfig(cache);
    this.applyScoreConfig(score);
    this.theme = options?.theme ?? defaults.theme;
    this.filterWords = [];
    this.bookPool = [];
    this.forcedExtractionMethod = null;
    this.validator.clearCache();
    this.cachedThresholds = this.buildThresholds(score);
    this.validator.resetRejectionStats();

    return this;
  }

  setExtractionMethod(
    method: 'punctuation' | 'chunk' | null,
  ): HaikuGeneratorService {
    this.forcedExtractionMethod = method;
    return this;
  }

  getRejectionStats(): RejectionStats {
    return this.validator.getRejectionStats();
  }

  resetRejectionStats(): void {
    this.validator.resetRejectionStats();
  }

  private applyCacheConfig(cache: CacheConfig): void {
    this.minCachedDocs = cache.minCachedDocs;
    this.useCache = cache.enabled;
    this.ttl = cache.ttl;
  }

  private applyScoreConfig(score: ScoreConfig): void {
    this.sentimentMinScore = score.sentiment;
    this.markovMinScore = score.markovChain;
    this.posMinScore = score.pos;
    this.trigramMinScore = score.trigram;
    this.tfidfMinScore = score.tfidf;
    this.phoneticsMinScore = score.phonetics;
    this.uniquenessMinScore = score.uniqueness;
  }

  private buildThresholds(score: ScoreConfig): ScoreThresholds {
    return {
      sentiment: score.sentiment ?? DEFAULT_SENTIMENT_MIN_SCORE,
      markov: score.markovChain ?? DEFAULT_MARKOV_MIN_SCORE,
      pos: score.pos ?? DEFAULT_GRAMMAR_MIN_SCORE,
      trigram: score.trigram ?? DEFAULT_TRIGRAM_MIN_SCORE,
      tfidf: score.tfidf ?? 0,
      phonetics: score.phonetics ?? DEFAULT_ALLITERATION_MIN_SCORE,
      uniqueness: score.uniqueness ?? DEFAULT_UNIQUENESS_MIN_SCORE,
      verseDistance: score.verseDistance ?? DEFAULT_VERSE_DISTANCE_MIN_SCORE,
      lineLengthBalance:
        score.lineLengthBalance ?? DEFAULT_LINE_BALANCE_MIN_SCORE,
      imageryDensity: score.imageryDensity ?? DEFAULT_IMAGERY_MIN_SCORE,
      semanticCoherence: score.semanticCoherence ?? DEFAULT_COHERENCE_MIN_SCORE,
      verbPresence: score.verbPresence ?? DEFAULT_VERB_MIN_SCORE,
      maxRepeatedWords: 0,
      allowWeakStart: true,
    };
  }

  filter(filterWords: string[]): HaikuGeneratorService {
    // Check if filter words changed to avoid unnecessary regex compilation
    const newKey =
      filterWords.length > 0 ? [...filterWords].sort().join('|') : null;

    if (this.filterWordsKey === newKey) {
      return this; // Already compiled for these words
    }

    this.filterWordsKey = newKey;
    this.filterWords = filterWords;

    if (filterWords.length === 0) {
      this.filterWordsRegex = null;
      return this;
    }

    const escapedWords = filterWords.map((word) =>
      word.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    );
    this.filterWordsRegex = new RegExp(escapedWords.join('|'), 'i');

    return this;
  }

  async extractFromCache(size: number): Promise<HaikuValue[]> {
    return await this.haikuRepository.extractFromCache(
      size,
      this.minCachedDocs,
    );
  }

  private async getBookFromPool(): Promise<BookValueWithChapters> {
    if (this.bookPool.length === 0) {
      this.bookPool = await this.bookRepository.selectRandomBooks(
        this.bookPoolSize,
      );
    }

    if (this.bookPool.length > 0) {
      return this.bookPool.pop()!;
    }
    return this.bookRepository.selectRandomBook();
  }

  async generate(): Promise<HaikuValue | null> {
    this.executionTime = Date.now();

    if (this.useCache === true) {
      const haiku = await this.haikuRepository.extractOneFromCache(
        this.minCachedDocs,
      );

      if (haiku !== null) {
        return haiku;
      }
    }

    return await this.buildFromDb();
  }

  async appendImg(
    haiku: HaikuValue,
    useImageAI: boolean = false,
  ): Promise<HaikuValue> {
    this.canvasService.useTheme(this.theme);

    const imagePath = await this.canvasService.create(haiku, useImageAI);
    const image = await this.canvasService.read(imagePath);

    await promisify(unlink)(imagePath);

    return {
      ...haiku,
      image: image.data.toString('base64'),
    };
  }

  async prepare(): Promise<void> {
    await this.markovEvaluator.load();

    if (!this.markovEvaluator.isReady()) {
      log.warn('Markov model not available - disabling markov validation');
      this.disableMarkovValidation();
    }
  }

  private disableMarkovValidation(): void {
    if (this.cachedThresholds) {
      this.cachedThresholds.markov = 0;
      this.cachedThresholds.trigram = 0;
    }
    this.markovMinScore = 0;
    this.trigramMinScore = 0;
  }

  async buildFromDb(): Promise<HaikuValue | null> {
    this.executionTime = Date.now();
    await this.prepare();

    const result = await this.buildFromDbWithYielding();

    if (result && this.useCache) {
      await this.haikuRepository.createCacheWithTTL(result, this.ttl);
    }

    return result;
  }

  private async buildFromDbWithYielding(): Promise<HaikuValue | null> {
    let verses = [];
    let book = null;
    let chapter = null;
    let chapters: ChapterWithBook[] = [];
    let i = 1;

    if (this.filterWords.length > 0) {
      chapters = await this.chapterRepository.getFilteredChapters(
        this.filterWords,
      );
    }
    if (chapters.length === 0) {
      book = await this.getBookFromPool();
    }

    let indices: number[] = [];
    let totalQuotes = 0;

    while (verses.length < 3 && i < this.maxAttempts) {
      const chunkResult = await this.processChunk(
        chapters,
        book,
        i,
        Math.min(this.chunkSize, this.maxAttempts - i + 1),
      );

      verses = chunkResult.verses;
      indices = chunkResult.indices;
      totalQuotes = chunkResult.totalQuotes;
      chapter = chunkResult.chapter;
      book = chunkResult.book;
      i = chunkResult.nextIteration;

      if (verses.length >= 3) {
        break;
      }

      await new Promise<void>((resolve) => {
        setImmediate(resolve);
      });
    }

    if (verses.length < 3) {
      throw new MaxAttemptsException({
        maxAttempts: this.maxAttempts,
        versesFound: verses.length,
        filterWords: this.filterWords.length > 0 ? this.filterWords : undefined,
      });
    }

    return this.buildHaiku(book, chapter, verses, indices, totalQuotes);
  }

  private async processChunk(
    chapters: ChapterWithBook[],
    currentBook: BookValueWithChapters | null,
    startIteration: number,
    chunkSize: number,
  ): Promise<{
    verses: string[];
    indices: number[];
    totalQuotes: number;
    chapter: ChapterValue;
    book: BookValueWithChapters;
    nextIteration: number;
  }> {
    let verses: string[] = [];
    let indices: number[] = [];
    let totalQuotes = 0;
    let book = currentBook;
    let chapter = null;

    for (let i = 0; i < chunkSize; i++) {
      const currentIteration = startIteration + i;

      if (chapters.length > 0) {
        const randomIndex = Math.floor(Math.random() * chapters.length);
        chapter = chapters[randomIndex];
        book = chapter.book;
      }

      if (chapters.length === 0) {
        if (!book) {
          book = await this.getBookFromPool();
        }
        chapter = this.selectRandomChapter(book);
      }

      const result = this.getVerses(chapter);
      verses = result.verses;
      indices = result.indices;
      totalQuotes = result.totalQuotes;

      if (
        this.filterWords.length > 0 &&
        !this.verseContainsFilterWord(verses)
      ) {
        verses = [];
        indices = [];
      }

      if (verses.length >= 3) {
        return {
          book,
          chapter,
          nextIteration: currentIteration + 1,
          verses,
          indices,
          totalQuotes,
        };
      }

      if (currentIteration % this.maxAttemptsInBook === 0) {
        book = await this.getBookFromPool();
      }
    }

    return {
      book,
      chapter,
      nextIteration: startIteration + chunkSize,
      verses,
      indices,
      totalQuotes,
    };
  }

  getVerses(chapter: ChapterValue): {
    verses: string[];
    indices: number[];
    totalQuotes: number;
  } {
    const quotes = this.extractQuotes(chapter.content);

    if (quotes.length === 0) {
      return { verses: [], indices: [], totalQuotes: 0 };
    }

    const result = this.selectHaikuVerses(quotes, quotes.length);

    if (result === null) {
      return { verses: [], indices: [], totalQuotes: quotes.length };
    }

    return {
      verses: result.verses,
      indices: result.indices,
      totalQuotes: quotes.length,
    };
  }

  verseContainsFilterWord(verses: string[]): boolean {
    if (!this.filterWordsRegex) {
      return true;
    }
    return verses.some((verse) => this.filterWordsRegex.test(verse));
  }

  buildHaiku(
    book: BookValue,
    chapter: ChapterValue,
    verses: string[],
    indices: number[] = [],
    totalQuotes = 0,
  ): HaikuValue {
    const executionTime = (Date.now() - this.executionTime) / 1000;
    const cleanedVerses = cleanVerses(verses);

    return {
      book: {
        reference: book.reference,
        title: book.title,
        author: book.author,
        emoticons: book.emoticons,
      },
      cacheUsed: false,
      chapter: chapter,
      context: extractContextVerses(verses, chapter.content),
      executionTime: executionTime,
      rawVerses: verses,
      verses: cleanedVerses,
      quality: calculateHaikuQuality(
        cleanedVerses,
        this.calculateQualityMetrics(cleanedVerses, indices, totalQuotes),
      ),
      extractionMethod: this.lastExtractionMethod,
    };
  }

  selectRandomChapter(book: BookValueWithChapters): string {
    return book.chapters[
      Math.floor(Math.random() * book.chapters.length).toString()
    ];
  }

  private calculateQualityMetrics(
    verses: string[],
    verseIndices: number[] = [],
    totalQuotes = 0,
  ): QualityMetrics {
    if (verses.length === 0) {
      return {
        sentiment: 0.5,
        grammar: 0,
        trigramFlow: 0,
        markovFlow: 0,
        alliteration: 0,
      };
    }

    const sentimentSum = verses.reduce(
      (acc, verse) => acc + this.naturalLanguage.analyzeSentiment(verse),
      0,
    );
    const sentiment = sentimentSum / verses.length;

    const grammarSum = verses.reduce(
      (acc, verse) => acc + this.naturalLanguage.analyzeGrammar(verse).score,
      0,
    );
    const grammar = grammarSum / verses.length;

    const trigramFlow = this.markovEvaluator.evaluateHaikuTrigrams(verses);
    const markovFlow = this.markovEvaluator.evaluateHaiku(verses);

    const phonetics = this.naturalLanguage.analyzePhonetics(verses);
    const alliteration = phonetics.alliterationScore;

    const posResults = verses.flatMap((v) =>
      this.naturalLanguage.getPOSTags(v),
    );

    return {
      sentiment,
      grammar,
      trigramFlow,
      markovFlow,
      alliteration,
      verseIndices,
      totalQuotes,
      posResults,
    };
  }

  extractQuotes(chapter: string): QuoteCandidate[] {
    const nl = this.naturalLanguage;
    const allExtractors: [ExtractionMethod, () => string[]][] = [
      ['punctuation', () => nl.extractSentencesByPunctuation(chapter)],
      ['chunk', () => nl.extractWordChunks(chapter)],
    ];

    const extractors = this.forcedExtractionMethod
      ? allExtractors.filter(([name]) => name === this.forcedExtractionMethod)
      : allExtractors;

    for (const [name, fn] of extractors) {
      const sentences = fn();

      if (this.cachedThresholds?.tfidf > 0) {
        nl.initTfIdf(sentences);
      }
      let quotes = this.filterQuotesCountingSyllables(
        sentences.map((quote, index) => ({ index, quote })),
      );

      if (name === 'chunk') {
        quotes = quotes.filter((q) => {
          const grammar = nl.analyzeGrammar(q.quote);
          if (grammar.score < 0.5) {
            return false;
          }

          const words = q.quote.split(/\s+/);
          for (let i = 1; i < words.length; i++) {
            if (words[i] && /^[A-Z]/.test(words[i])) {
              return false;
            }
          }
          return true;
        });
      }

      const minRequired = MIN_QUOTES_THRESHOLD[name];

      if (quotes.length >= minRequired) {
        this.lastExtractionMethod = name;
        log.debug(
          { method: name, count: quotes.length, threshold: minRequired },
          'Extraction succeeded',
        );
        return quotes;
      }
    }
    return [];
  }

  filterQuotesCountingSyllables(
    quotes: { quote: string; index: number }[],
  ): QuoteCandidate[] {
    const filtered: QuoteCandidate[] = [];

    for (const { quote, index } of quotes) {
      const words = this.naturalLanguage.extractWords(quote);

      if (!words) {
        continue;
      }
      const syllableCount = words.reduce((c, w) => c + syllable(w), 0);

      if (syllableCount === 5 || syllableCount === 7) {
        filtered.push({ quote, index, syllableCount });
      }
    }
    return filtered;
  }

  selectHaikuVerses(
    quotes: QuoteCandidate[],
    totalQuotes?: number,
  ): { verses: string[]; indices: number[] } | null {
    const syllableCounts = [5, 7, 5];
    const thresholds = this.getScoreThresholds();
    const selectedVerses: QuoteCandidate[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < syllableCounts.length; i++) {
      const targetSyllables = syllableCounts[i];

      const syllableMatches = quotes.filter(
        (q) => q.syllableCount === targetSyllables && !usedIndices.has(q.index),
      );

      const matchingQuotes = syllableMatches.filter((candidate) =>
        this.validator.isQuoteValidForVerse(
          candidate,
          i === 0,
          selectedVerses,
          thresholds,
        ),
      );

      if (matchingQuotes.length === 0) {
        return null;
      }

      const randomIndex = Math.floor(Math.random() * matchingQuotes.length);
      const selectedQuote = matchingQuotes[randomIndex];

      selectedVerses.push(selectedQuote);
      usedIndices.add(selectedQuote.index);
    }

    const verses = selectedVerses.map(({ quote }) => quote);
    const indices = selectedVerses.map(({ index }) => index);
    const total = totalQuotes ?? quotes.length;

    if (
      !this.validator.passesFullHaikuFilters(verses, indices, total, thresholds)
    ) {
      return null;
    }

    return { verses, indices };
  }

  private getScoreThresholds(): ScoreThresholds {
    return (
      this.cachedThresholds ??
      this.buildThresholds(HaikuGeneratorService.DEFAULT_CONFIG.score)
    );
  }

  isQuoteInvalid(quote: string): boolean {
    return this.validator.isQuoteInvalid(quote);
  }

  /**
   * Extract verse pools from chapter content directly (for cases when chapter content is already available)
   */
  extractVersePoolsFromContent(
    content: string,
    bookId: string,
    chapterId: string,
  ): VersePools {
    const quotes = this.extractQuotes(content);

    const fiveSyllable: VerseCandidate[] = [];
    const sevenSyllable: VerseCandidate[] = [];

    for (const candidate of quotes) {
      const verseCandidate: VerseCandidate = {
        text: candidate.quote,
        syllableCount: candidate.syllableCount as 5 | 7,
        sourceIndex: candidate.index,
      };

      if (candidate.syllableCount === 5) {
        fiveSyllable.push(verseCandidate);
        continue;
      }

      if (candidate.syllableCount === 7) {
        sevenSyllable.push(verseCandidate);
      }
    }

    return {
      fiveSyllable,
      sevenSyllable,
      bookId,
      chapterId,
    };
  }

  /**
   * Get NaturalLanguageService for external use (e.g., by GA FitnessEvaluator)
   */
  getNaturalLanguageService(): NaturalLanguageService {
    return this.naturalLanguage;
  }

  /**
   * Get MarkovEvaluator for external use (e.g., by GA FitnessEvaluator)
   */
  getMarkovEvaluator(): MarkovEvaluatorService {
    return this.markovEvaluator;
  }
}
