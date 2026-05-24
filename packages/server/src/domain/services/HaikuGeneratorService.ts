import { promisify } from 'node:util';
import { unlink } from 'node:fs';
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
import type { VersePools } from './genetic/types';
import type {
  VerseEmbeddingService,
  EnhancedVersePools,
} from '../ml/VerseEmbeddingService';
import {
  computeQualityMetrics,
  extractQuotes,
  filterQuotesCountingSyllables,
  quotesToVersePools,
  selectHaikuVerses,
} from './HaikuExtractionHelpers';
import {
  DEFAULT_GENERATOR_CONFIG,
  buildThresholds,
} from './HaikuGeneratorConfig';

@singleton()
export default class HaikuGeneratorService implements IGenerator {
  private readonly maxAttempts = 500;
  private readonly maxAttemptsInBook = 50;
  private readonly chunkSize = 10;
  private readonly bookPoolSize = 10;

  private minCachedDocs!: number;
  private ttl!: number;
  private useCache!: boolean;
  private theme!: string;
  private executionTime!: number;
  private filterWords: string[];
  private filterWordsRegex: RegExp | null = null;
  private filterWordsKey: string | null = null;
  private sentimentMinScore!: number | null;
  private markovMinScore!: number | null;
  private posMinScore!: number | null;
  private trigramMinScore!: number | null;
  private tfidfMinScore!: number | null;
  private phoneticsMinScore!: number | null;
  private uniquenessMinScore!: number | null;

  private bookPool: BookValueWithChapters[] = [];
  private cachedThresholds: ScoreThresholds | null = null;
  private lastExtractionMethod: ExtractionMethod = 'punctuation';
  private forcedExtractionMethod: 'punctuation' | 'chunk' | null = null;
  private validator: HaikuValidatorService;
  private verseEmbeddingService: VerseEmbeddingService | null = null;

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
    const defaults = DEFAULT_GENERATOR_CONFIG;
    const cache = { ...defaults.cache, ...options?.cache };
    const score = { ...defaults.score, ...options?.score };

    this.applyCacheConfig(cache);
    this.applyScoreConfig(score);
    this.theme = options?.theme ?? defaults.theme;
    this.filterWords = [];
    this.bookPool = [];
    this.forcedExtractionMethod = null;
    this.validator.clearCache();
    this.cachedThresholds = buildThresholds(score);
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
      this.disableMarkovValidation();
    }
  }

  public disableMarkovValidation(): void {
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
    let verses: string[] = [];
    let book: BookValueWithChapters | null = null;
    let chapter: ChapterValue | null = null;
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

    return this.buildHaiku(book!, chapter!, verses, indices, totalQuotes);
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
    let book: BookValueWithChapters | null = currentBook;
    let chapter: ChapterValue | ChapterWithBook | null = null;

    for (let i = 0; i < chunkSize; i++) {
      const currentIteration = startIteration + i;

      if (chapters.length > 0) {
        const randomIndex = Math.floor(Math.random() * chapters.length);
        const selectedChapter = chapters[randomIndex]!;
        chapter = selectedChapter;
        book = selectedChapter.book;
      }

      if (chapters.length === 0) {
        if (!book) {
          book = await this.getBookFromPool();
        }
        chapter = this.selectRandomChapter(book);
      }

      const result = this.getVerses(chapter!);
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
          book: book!,
          chapter: chapter!,
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
      book: book!,
      chapter: chapter!,
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
    const regex = this.filterWordsRegex;
    if (!regex) {
      return true;
    }
    return verses.some((verse) => regex.test(verse));
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
      chapter,
      context: extractContextVerses(verses, chapter.content),
      executionTime,
      rawVerses: verses,
      verses: cleanedVerses,
      quality: calculateHaikuQuality(
        cleanedVerses,
        this.calculateQualityMetrics(cleanedVerses, indices, totalQuotes),
      ),
      extractionMethod: this.lastExtractionMethod,
    };
  }

  selectRandomChapter(book: BookValueWithChapters): ChapterValue {
    const chapters = (book.chapters ?? []) as ChapterValue[];
    return chapters[Math.floor(Math.random() * chapters.length)]!;
  }

  private calculateQualityMetrics(
    verses: string[],
    verseIndices: number[] = [],
    totalQuotes = 0,
  ): QualityMetrics {
    return computeQualityMetrics(
      this.naturalLanguage,
      this.markovEvaluator,
      verses,
      verseIndices,
      totalQuotes,
    );
  }

  extractQuotes(chapter: string): QuoteCandidate[] {
    const { quotes, method } = extractQuotes(this.naturalLanguage, chapter, {
      forcedExtractionMethod: this.forcedExtractionMethod,
      thresholds: this.cachedThresholds,
    });

    if (method !== null) {
      this.lastExtractionMethod = method;
    }

    return quotes;
  }

  filterQuotesCountingSyllables(
    quotes: { quote: string; index: number }[],
  ): QuoteCandidate[] {
    return filterQuotesCountingSyllables(this.naturalLanguage, quotes);
  }

  selectHaikuVerses(
    quotes: QuoteCandidate[],
    totalQuotes?: number,
  ): { verses: string[]; indices: number[] } | null {
    return selectHaikuVerses(
      this.validator,
      quotes,
      this.getScoreThresholds(),
      totalQuotes,
    );
  }

  private getScoreThresholds(): ScoreThresholds {
    return (
      this.cachedThresholds ?? buildThresholds(DEFAULT_GENERATOR_CONFIG.score)
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

    return quotesToVersePools(quotes, bookId, chapterId);
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

  /**
   * Set the verse embedding service for extraction with ML embeddings
   */
  setVerseEmbeddingService(service: VerseEmbeddingService): void {
    this.verseEmbeddingService = service;
  }

  /**
   * Get the verse embedding service
   */
  getVerseEmbeddingService(): VerseEmbeddingService | null {
    return this.verseEmbeddingService;
  }

  /**
   * Extract verse pools with computed embeddings from chapter content
   * Returns verse pools with 64-dimensional embedding vectors for each verse
   */
  private requireVerseEmbeddingService(): VerseEmbeddingService {
    if (!this.verseEmbeddingService) {
      throw new Error(
        'VerseEmbeddingService not set. Call setVerseEmbeddingService first.',
      );
    }

    return this.verseEmbeddingService;
  }

  async extractEnhancedVersePoolsFromContent(
    content: string,
    bookId: string,
    chapterId: string,
  ): Promise<EnhancedVersePools> {
    const versePools = this.extractVersePoolsFromContent(
      content,
      bookId,
      chapterId,
    );

    return this.requireVerseEmbeddingService().embedVersePools(versePools);
  }

  /**
   * Compute embedding-based semantic coherence for three verses
   * Returns a score in [0, 1] based on average pairwise embedding similarity
   */
  async computeEmbeddingCoherence(
    verses: [string, string, string],
  ): Promise<number> {
    return this.requireVerseEmbeddingService().computeSemanticCoherenceFromText(
      verses,
    );
  }
}
