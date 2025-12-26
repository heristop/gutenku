import log from 'loglevel';
import { promisify } from 'util';
import { unlink } from 'fs';
import { syllable } from 'syllable';
import { singleton } from 'tsyringe';
import {
  BookValue,
  ChapterValue,
  HaikuValue,
  ProcessedChapter,
  HaikuProcessingCache,
} from '../../shared/types';
import { MarkovEvaluatorService } from './MarkovEvaluatorService';
import NaturalLanguageService from './NaturalLanguageService';
import { ICanvasServiceToken, ICanvasService } from './ICanvasService';
import { IGenerator } from '../interfaces/IGenerator';
import { IHaikuRepository } from '../repositories/IHaikuRepository';
import { IChapterRepository } from '../repositories/IChapterRepository';
import { IBookRepository } from '../repositories/IBookRepository';
import { PubSubService } from '../../infrastructure/services/PubSubService';
import { inject } from 'tsyringe';
import { IEventBusToken, IEventBus } from '../events/IEventBus';
import { QuoteGeneratedEvent } from '../events/QuoteGeneratedEvent';
import HaikuHelper from '../../shared/helpers/HaikuHelper';

class MaxAttemptsError extends Error {
  constructor(message?: string) {
    super(message);

    this.name = 'MaxAttemptsError';
  }
}

@singleton()
export default class HaikuGeneratorService implements IGenerator {
  private readonly maxAttempts = 500;
  private readonly maxAttemptsInBook = 50;
  private readonly chunkSize = 10; // Process 10 attempts before yielding

  private minCachedDocs: number;
  private ttl: number;
  private useCache: boolean;
  private theme: string;
  private executionTime: number;
  private filterWords: string[];
  private filterWordsRegex: RegExp | null = null;
  private sentimentMinScore: number;
  private markovMinScore: number;

  private processingCache: HaikuProcessingCache;

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
    @inject(PubSubService) private readonly pubSubService: PubSubService,
    @inject(IEventBusToken) private readonly eventBus: IEventBus,
  ) {
    this.filterWords = [];

    this.processingCache = {
      chapters: new Map<string, ProcessedChapter>(),
      maxCacheSize: 100,
      ttlMs: 60 * 60 * 1000,
    };
  }

  configure(options?: {
    cache: {
      minCachedDocs: number;
      ttl: number;
      enabled: boolean;
    };
    score: {
      sentiment: number;
      markovChain: number;
    };
    theme: string;
  }): HaikuGeneratorService {
    this.minCachedDocs = options?.cache.minCachedDocs ?? 100;
    this.useCache = options?.cache.enabled ?? false;
    this.ttl = options?.cache.ttl ?? 0;
    this.theme = options?.theme ?? 'random';
    this.filterWords = [];
    this.sentimentMinScore = options?.score.sentiment ?? null;
    this.markovMinScore = options?.score.markovChain ?? null;

    return this;
  }

  filter(filterWords: string[]): HaikuGeneratorService {
    this.filterWords = filterWords;

    if (filterWords.length > 0) {
      const escapedWords = filterWords.map((word) =>
        word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      );
      this.filterWordsRegex = new RegExp(escapedWords.join('|'), 'i');
    } else {
      this.filterWordsRegex = null;
    }

    return this;
  }

  async extractFromCache(size: number): Promise<HaikuValue[]> {
    return await this.haikuRepository.extractFromCache(
      size,
      this.minCachedDocs,
    );
  }

  async generate(): Promise<HaikuValue | null> {
    this.executionTime = new Date().getTime();

    if (true === this.useCache) {
      const haiku = await this.haikuRepository.extractOneFromCache(
        this.minCachedDocs,
      );

      if (null !== haiku) {
        return haiku;
      }
    }

    return await this.buildFromDb();
  }

  async appendImg(haiku: HaikuValue): Promise<HaikuValue> {
    this.canvasService.useTheme(this.theme);

    const imagePath = await this.canvasService.create(haiku);
    const image = await this.canvasService.read(imagePath);

    await promisify(unlink)(imagePath);

    return {
      ...haiku,
      image: image.data.toString('base64'),
    };
  }

  async prepare(): Promise<void> {
    await this.markovEvaluator.load();
  }

  async buildFromDb(): Promise<HaikuValue | null> {
    await this.prepare();

    const result = await this.buildFromDbWithYielding();

    if (result) {
      await this.haikuRepository.createCacheWithTTL(result, this.ttl);
    }

    return result;
  }

  private async buildFromDbWithYielding(): Promise<HaikuValue | null> {
    let verses = [];
    let book = null;
    let chapter = null;
    let chapters = [];
    let i = 1;

    if (this.filterWords.length > 0) {
      chapters = await this.chapterRepository.getFilteredChapters(
        this.filterWords,
      );
    }

    if (0 === chapters.length) {
      book = await this.bookRepository.selectRandomBook();
    }

    while (verses.length < 3 && i < this.maxAttempts) {
      const chunkResult = await this.processChunk(
        chapters,
        book,
        i,
        Math.min(this.chunkSize, this.maxAttempts - i + 1),
      );

      verses = chunkResult.verses;
      chapter = chunkResult.chapter;
      book = chunkResult.book;
      i = chunkResult.nextIteration;

      if (verses.length >= 3) {
        break;
      }

      await new Promise((resolve) => setImmediate(resolve));
    }

    if (verses.length < 3) {
      throw new MaxAttemptsError('max-attempts-error');
    }

    return this.buildHaiku(book, chapter, verses);
  }

  private async processChunk(
    chapters: ChapterValue[],
    currentBook: BookValue | null,
    startIteration: number,
    chunkSize: number,
  ): Promise<{
    verses: string[];
    chapter: ChapterValue;
    book: BookValue;
    nextIteration: number;
  }> {
    let verses = [];
    let book = currentBook;
    let chapter = null;

    for (let i = 0; i < chunkSize; i++) {
      const currentIteration = startIteration + i;

      if (chapters.length > 0) {
        const randomIndex = Math.floor(Math.random() * chapters.length);
        chapter = chapters[randomIndex];
        book = chapter.book;
      } else {
        if (!book) {
          book = await this.bookRepository.selectRandomBook();
        }
        chapter = this.selectRandomChapter(book);
      }

      verses = this.getVerses(chapter);

      if (this.filterWords.length > 0) {
        if (!this.verseContainsFilterWord(verses)) {
          verses = [];
        }
      }

      if (verses.length >= 3) {
        return {
          verses,
          chapter,
          book,
          nextIteration: currentIteration + 1,
        };
      }

      if (currentIteration % this.maxAttemptsInBook === 0) {
        book = await this.bookRepository.selectRandomBook();
      }
    }

    return {
      verses,
      chapter,
      book,
      nextIteration: startIteration + chunkSize,
    };
  }

  getVerses(chapter: ChapterValue): string[] {
    const quotes = this.extractQuotes(chapter.content);

    return quotes.length > 0 ? this.selectHaikuVerses(quotes) : [];
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
  ): HaikuValue {
    const executionTime = (new Date().getTime() - this.executionTime) / 1000;

    return {
      book: {
        reference: book.reference,
        title: book.title,
        author: book.author,
      },
      chapter: chapter,
      context: HaikuHelper.extractContextVerses(verses, chapter.content),
      verses: HaikuHelper.clean(verses),
      rawVerses: verses,
      cacheUsed: false,
      executionTime: executionTime,
    };
  }

  selectRandomChapter(book: BookValue): string {
    const index = Math.floor(Math.random() * book.chapters.length);

    return book.chapters[index.toString()];
  }

  extractQuotes(chapter: string): { quote: string; index: number }[] {
    const sentences =
      this.naturalLanguage.extractSentencesByPunctuation(chapter);
    const quotes = sentences.map((quote, index) => ({ quote, index }));

    return this.filterQuotesCountingSyllables(quotes);
  }

  filterQuotesCountingSyllables(
    quotes: { quote: string; index: number }[],
  ): { quote: string; index: number }[] {
    const filteredQuotes = quotes.filter(({ quote }) => {
      const words = this.naturalLanguage.extractWords(quote);

      if (!words) {
        return false;
      }

      const syllableCount = words.reduce((count, word) => {
        return count + syllable(word);
      }, 0);

      return syllableCount === 5 || syllableCount === 7;
    });

    const minQuotesCount = parseInt(process.env.MIN_QUOTES_COUNT) || 12;

    if (minQuotesCount && filteredQuotes.length < minQuotesCount) {
      return [];
    }

    return filteredQuotes;
  }

  selectHaikuVerses(quotes: { quote: string; index: number }[]): string[] {
    const syllableCounts = [5, 7, 5];

    const sentimentMinScore =
      this.sentimentMinScore ??
      parseFloat(process.env.SENTIMENT_MIN_SCORE || '0');
    const markovMinScore =
      this.markovMinScore ?? parseFloat(process.env.MARKOV_MIN_SCORE || '0');

    const selectedVerses: { quote: string; index: number }[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < syllableCounts.length; i++) {
      const count = syllableCounts[i];

      const matchingQuotes = quotes.filter(({ quote, index }) => {
        if (usedIndices.has(index)) {
          return false;
        }

        quote = quote.replaceAll(/\n/g, ' ');

        if (i === 0 && this.naturalLanguage.startWithConjunction(quote)) {
          return false;
        }

        if (this.isQuoteInvalid(quote)) {
          return false;
        }

        const syllableCount = this.naturalLanguage.countSyllables(quote);

        if (syllableCount !== count) {
          return false;
        }

        log.info('quote', quote.split(' '));

        const sentimentScore = this.naturalLanguage.analyzeSentiment(quote);

        if (sentimentScore < sentimentMinScore) {
          return false;
        }

        log.info('sentiment_score', sentimentScore, 'min', sentimentMinScore);

        if (selectedVerses.length > 0) {
          const lastVerseIndex =
            selectedVerses[selectedVerses.length - 1].index;

          if (index <= lastVerseIndex) {
            return false;
          }

          const quotesToEvaluate = [
            ...selectedVerses.map((verse) => verse.quote),
            quote,
          ];

          const markovScore =
            this.markovEvaluator.evaluateHaiku(quotesToEvaluate);

          if (markovScore < markovMinScore) {
            return false;
          }

          log.info('markov_score', markovScore, 'min', markovMinScore);

          this.eventBus.publish(new QuoteGeneratedEvent({ quote }));
        }

        return true;
      });

      if (matchingQuotes.length === 0) {
        return [];
      }

      const randomIndex = Math.floor(Math.random() * matchingQuotes.length);
      const selectedQuote = matchingQuotes[randomIndex];

      selectedVerses.push(selectedQuote);
      usedIndices.add(selectedQuote.index);
    }

    return selectedVerses.map(({ quote }) => quote);
  }

  isQuoteInvalid(quote: string): boolean {
    quote = quote.replaceAll(/\n/g, '');

    if (this.naturalLanguage.hasUpperCaseWords(quote)) {
      return true;
    }

    if (this.naturalLanguage.hasBlacklistedCharsInQuote(quote)) {
      return true;
    }

    if (quote.length >= parseInt(process.env.VERSE_MAX_LENGTH || '30')) {
      return true;
    }

    return false;
  }
}
