import { promisify } from 'node:util';
import { unlink } from 'node:fs';
import { singleton, inject } from 'tsyringe';
import type {
  BookValue,
  BookValueWithChapters,
  ChapterValue,
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
import { MaxAttemptsException } from '~/domain/exceptions';
import { type QualityMetrics } from '~/shared/constants/validation';
import type {
  CacheConfig,
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
import {
  buildHaiku as buildHaikuFromParts,
  runBuildLoop,
  selectRandomChapter as selectRandomChapterFromBook,
} from './HaikuGeneratorService.builders';
import {
  compileFilterWordsRegex,
  computeEmbeddingCoherence as computeEmbeddingCoherenceFromService,
  extractEnhancedVersePools,
} from './HaikuGeneratorService.helpers';
import { HaikuBookPool } from './HaikuBookPool';

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

  private cachedThresholds: ScoreThresholds | null = null;
  private lastExtractionMethod: ExtractionMethod = 'punctuation';
  private forcedExtractionMethod: 'punctuation' | 'chunk' | null = null;
  private validator: HaikuValidatorService;
  private verseEmbeddingService: VerseEmbeddingService | null = null;
  private bookPool: HaikuBookPool;

  constructor(
    @inject('IHaikuRepository')
    private readonly haikuRepository: IHaikuRepository,
    @inject('IChapterRepository')
    private readonly chapterRepository: IChapterRepository,
    @inject('IBookRepository') bookRepository: IBookRepository,
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
    this.bookPool = new HaikuBookPool(bookRepository, this.bookPoolSize);
  }

  configure(options?: Partial<GeneratorConfig>): HaikuGeneratorService {
    const defaults = DEFAULT_GENERATOR_CONFIG;
    const cache = { ...defaults.cache, ...options?.cache };
    const score = { ...defaults.score, ...options?.score };

    this.applyCacheConfig(cache);
    this.theme = options?.theme ?? defaults.theme;
    this.filterWords = [];
    this.bookPool.reset();
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

  filter(filterWords: string[]): HaikuGeneratorService {
    const compiled = compileFilterWordsRegex(filterWords, this.filterWordsKey);

    if (compiled === undefined) {
      return this;
    }

    this.filterWordsKey = compiled.key;
    this.filterWords = filterWords;
    this.filterWordsRegex = compiled.regex;

    return this;
  }

  async extractFromCache(size: number): Promise<HaikuValue[]> {
    return await this.haikuRepository.extractFromCache(
      size,
      this.minCachedDocs,
    );
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
  }

  async buildFromDb(): Promise<HaikuValue | null> {
    this.executionTime = Date.now();
    await this.prepare();

    const { book, chapter, verses, indices, totalQuotes } = await runBuildLoop({
      maxAttempts: this.maxAttempts,
      chunkSize: this.chunkSize,
      filterWords: this.filterWords,
      getFilteredChapters: (words) =>
        this.chapterRepository.getFilteredChapters(words),
      getBookFromPool: () => this.bookPool.next(),
      chunkCtx: {
        filterWords: this.filterWords,
        maxAttemptsInBook: this.maxAttemptsInBook,
        getBookFromPool: () => this.bookPool.next(),
        selectRandomChapter: (b) => this.selectRandomChapter(b),
        getVerses: (c) => this.getVerses(c),
        verseContainsFilterWord: (v) => this.verseContainsFilterWord(v),
      },
      onMaxAttempts: (versesFound) => {
        throw new MaxAttemptsException({
          maxAttempts: this.maxAttempts,
          versesFound,
          filterWords:
            this.filterWords.length > 0 ? this.filterWords : undefined,
        });
      },
    });

    const result = this.buildHaiku(book, chapter, verses, indices, totalQuotes);

    if (result && this.useCache) {
      await this.haikuRepository.createCacheWithTTL(result, this.ttl);
    }

    return result;
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
    return buildHaikuFromParts(book, chapter, verses, indices, totalQuotes, {
      executionStartMs: this.executionTime,
      lastExtractionMethod: this.lastExtractionMethod,
      calculateQualityMetrics: (v, idx, total) =>
        this.calculateQualityMetrics(v, idx, total),
    });
  }

  selectRandomChapter(book: BookValueWithChapters): ChapterValue {
    return selectRandomChapterFromBook(book);
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

    return extractEnhancedVersePools(this.verseEmbeddingService, versePools);
  }

  /**
   * Compute embedding-based semantic coherence for three verses
   * Returns a score in [0, 1] based on average pairwise embedding similarity
   */
  async computeEmbeddingCoherence(
    verses: [string, string, string],
  ): Promise<number> {
    return computeEmbeddingCoherenceFromService(
      this.verseEmbeddingService,
      verses,
    );
  }
}
