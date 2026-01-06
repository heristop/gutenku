import { promisify } from 'node:util';
import { createLogger } from '~/infrastructure/services/Logger';
import { unlink } from 'node:fs';
import { syllable } from 'syllable';
import { singleton, inject } from 'tsyringe';
import type {
  BookValue,
  BookValueWithChapters,
  ChapterValue,
  HaikuValue,
} from '~/shared/types';
import { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';
import NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import {
  type ICanvasService,
  ICanvasServiceToken,
} from '~/domain/services/ICanvasService';
import type { IGenerator } from '~/domain/interfaces/IGenerator';
import type { IHaikuRepository } from '~/domain/repositories/IHaikuRepository';
import type { IChapterRepository } from '~/domain/repositories/IChapterRepository';
import type { IBookRepository } from '~/domain/repositories/IBookRepository';
import { PubSubService } from '~/infrastructure/services/PubSubService';
import { type IEventBus, IEventBusToken } from '~/domain/events/IEventBus';
import { QuoteGeneratedEvent } from '~/domain/events/QuoteGeneratedEvent';
import {
  extractContextVerses,
  cleanVerses,
} from '~/shared/helpers/HaikuHelper';
import { MaxAttemptsException } from '~/domain/exceptions';

const log = createLogger('haiku');

interface CacheConfig {
  minCachedDocs: number;
  ttl: number;
  enabled: boolean;
}

interface ScoreConfig {
  sentiment: number | null;
  markovChain: number | null;
  pos: number | null;
  trigram: number | null;
  tfidf: number | null;
  phonetics: number | null;
}

interface GeneratorConfig {
  cache: CacheConfig;
  score: ScoreConfig;
  theme: string;
}

interface ScoreThresholds {
  sentiment: number;
  markov: number;
  pos: number;
  trigram: number;
  tfidf: number;
  phonetics: number;
}

interface QuoteCandidate {
  quote: string;
  index: number;
}

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
    },
    theme: 'random',
  };

  private readonly maxAttempts = 500;
  private readonly maxAttemptsInBook = 50;
  private readonly chunkSize = 10;

  private minCachedDocs: number;
  private ttl: number;
  private useCache: boolean;
  private theme: string;
  private executionTime: number;
  private filterWords: string[];
  private filterWordsRegex: RegExp | null = null;
  private sentimentMinScore: number | null;
  private markovMinScore: number | null;
  private posMinScore: number | null;
  private trigramMinScore: number | null;
  private tfidfMinScore: number | null;
  private phoneticsMinScore: number | null;

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
  }

  configure(options?: Partial<GeneratorConfig>): HaikuGeneratorService {
    const defaults = HaikuGeneratorService.DEFAULT_CONFIG;
    const cache = { ...defaults.cache, ...options?.cache };
    const score = { ...defaults.score, ...options?.score };

    this.minCachedDocs = cache.minCachedDocs;
    this.useCache = cache.enabled;
    this.ttl = cache.ttl;
    this.theme = options?.theme ?? defaults.theme;
    this.filterWords = [];
    this.sentimentMinScore = score.sentiment;
    this.markovMinScore = score.markovChain;
    this.posMinScore = score.pos;
    this.trigramMinScore = score.trigram;
    this.tfidfMinScore = score.tfidf;
    this.phoneticsMinScore = score.phonetics;

    return this;
  }

  filter(filterWords: string[]): HaikuGeneratorService {
    this.filterWords = filterWords;

    if (filterWords.length > 0) {
      const escapedWords = filterWords.map((word) =>
        word.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'),
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
  }

  async buildFromDb(): Promise<HaikuValue | null> {
    this.executionTime = Date.now();
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

    if (chapters.length === 0) {
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

    return this.buildHaiku(book, chapter, verses);
  }

  private async processChunk(
    chapters: ChapterValue[],
    currentBook: BookValueWithChapters | null,
    startIteration: number,
    chunkSize: number,
  ): Promise<{
    verses: string[];
    chapter: ChapterValue;
    book: BookValueWithChapters;
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

      if (
        this.filterWords.length > 0 &&
        !this.verseContainsFilterWord(verses)
      ) {
        verses = [];
      }

      if (verses.length >= 3) {
        return {
          book,
          chapter,
          nextIteration: currentIteration + 1,
          verses,
        };
      }

      if (currentIteration % this.maxAttemptsInBook === 0) {
        book = await this.bookRepository.selectRandomBook();
      }
    }

    return {
      book,
      chapter,
      nextIteration: startIteration + chunkSize,
      verses,
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
    const executionTime = (Date.now() - this.executionTime) / 1000;

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
      verses: cleanVerses(verses),
    };
  }

  selectRandomChapter(book: BookValueWithChapters): string {
    const index = Math.floor(Math.random() * book.chapters.length);

    return book.chapters[index.toString()];
  }

  extractQuotes(chapter: string): { quote: string; index: number }[] {
    const sentences =
      this.naturalLanguage.extractSentencesByPunctuation(chapter);
    const quotes = sentences.map((quote, index) => ({ index, quote }));

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

      const syllableCount = words.reduce(
        (count, word) => count + syllable(word),
        0,
      );

      return syllableCount === 5 || syllableCount === 7;
    });

    const minQuotesCount =
      Number.parseInt(process.env.MIN_QUOTES_COUNT, 10) || 12;

    if (minQuotesCount && filteredQuotes.length < minQuotesCount) {
      return [];
    }

    return filteredQuotes;
  }

  selectHaikuVerses(quotes: QuoteCandidate[]): string[] {
    const syllableCounts = [5, 7, 5];
    const thresholds = this.getScoreThresholds();
    const selectedVerses: QuoteCandidate[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < syllableCounts.length; i++) {
      const targetSyllables = syllableCounts[i];

      const matchingQuotes = quotes.filter(({ quote, index }) =>
        this.isQuoteValidForVerse(
          quote,
          index,
          targetSyllables,
          i === 0,
          usedIndices,
          selectedVerses,
          thresholds,
        ),
      );

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

  private getScoreThresholds(): ScoreThresholds {
    return {
      sentiment:
        this.sentimentMinScore ??
        Number.parseFloat(process.env.SENTIMENT_MIN_SCORE || '0'),
      markov:
        this.markovMinScore ??
        Number.parseFloat(process.env.MARKOV_MIN_SCORE || '0'),
      pos:
        this.posMinScore ??
        Number.parseFloat(process.env.POS_MIN_SCORE || '0'),
      trigram:
        this.trigramMinScore ??
        Number.parseFloat(process.env.TRIGRAM_MIN_SCORE || '0'),
      tfidf:
        this.tfidfMinScore ??
        Number.parseFloat(process.env.TFIDF_MIN_SCORE || '0'),
      phonetics:
        this.phoneticsMinScore ??
        Number.parseFloat(process.env.PHONETICS_MIN_SCORE || '0'),
    };
  }

  private isQuoteValidForVerse(
    rawQuote: string,
    index: number,
    targetSyllables: number,
    isFirstVerse: boolean,
    usedIndices: Set<number>,
    selectedVerses: QuoteCandidate[],
    thresholds: ScoreThresholds,
  ): boolean {
    if (usedIndices.has(index)) {return false;}

    const quote = rawQuote.replaceAll('\n', ' ');

    if (!this.passesBasicValidation(quote, targetSyllables, isFirstVerse)) {
      return false;
    }

    if (!this.passesScoreValidation(quote, thresholds)) {
      return false;
    }

    if (selectedVerses.length > 0) {
      return this.passesSequenceValidation(
        quote,
        index,
        selectedVerses,
        thresholds,
      );
    }

    return true;
  }

  private passesBasicValidation(
    quote: string,
    targetSyllables: number,
    isFirstVerse: boolean,
  ): boolean {
    if (isFirstVerse && this.naturalLanguage.startWithConjunction(quote)) {
      return false;
    }

    if (this.isQuoteInvalid(quote)) {return false;}

    const syllableCount = this.naturalLanguage.countSyllables(quote);
    return syllableCount === targetSyllables;
  }

  private passesScoreValidation(
    quote: string,
    thresholds: ScoreThresholds,
  ): boolean {
    log.debug({ quote: quote.split(' ') }, 'Evaluating quote');

    const sentimentScore = this.naturalLanguage.analyzeSentiment(quote);
    if (sentimentScore < thresholds.sentiment) {return false;}
    log.debug(
      { sentimentScore, min: thresholds.sentiment },
      'Sentiment score',
    );

    if (thresholds.pos > 0) {
      const grammarAnalysis = this.naturalLanguage.analyzeGrammar(quote);
      if (grammarAnalysis.score < thresholds.pos) {return false;}
      log.debug({ posScore: grammarAnalysis.score, min: thresholds.pos }, 'POS score');
    }

    if (thresholds.tfidf > 0) {
      const tfidfScore = this.naturalLanguage.scoreDistinctiveness(quote);
      if (tfidfScore < thresholds.tfidf) {return false;}
      log.debug({ tfidfScore, min: thresholds.tfidf }, 'TF-IDF score');
    }

    return true;
  }

  private passesSequenceValidation(
    quote: string,
    index: number,
    selectedVerses: QuoteCandidate[],
    thresholds: ScoreThresholds,
  ): boolean {
    const lastVerseIndex = selectedVerses.at(-1)!.index;
    if (index <= lastVerseIndex) {return false;}

    const quotesToEvaluate = [...selectedVerses.map((v) => v.quote), quote];

    const markovScore = this.markovEvaluator.evaluateHaiku(quotesToEvaluate);
    if (markovScore < thresholds.markov) {return false;}
    log.debug({ markovScore, min: thresholds.markov }, 'Markov score');

    if (thresholds.trigram > 0) {
      const trigramScore =
        this.markovEvaluator.evaluateHaikuTrigrams(quotesToEvaluate);
      if (trigramScore < thresholds.trigram) {return false;}
      log.debug({ trigramScore, min: thresholds.trigram }, 'Trigram score');
    }

    if (thresholds.phonetics > 0 && selectedVerses.length === 2) {
      const phoneticsAnalysis =
        this.naturalLanguage.analyzePhonetics(quotesToEvaluate);
      if (phoneticsAnalysis.alliterationScore < thresholds.phonetics) {
        return false;
      }
      log.debug(
        { phoneticsScore: phoneticsAnalysis.alliterationScore, min: thresholds.phonetics },
        'Phonetics score',
      );
    }

    this.eventBus.publish(new QuoteGeneratedEvent({ quote }));
    return true;
  }

  isQuoteInvalid(quote: string): boolean {
    quote = quote.replaceAll('\n', '');

    if (this.naturalLanguage.hasUpperCaseWords(quote)) {
      return true;
    }

    if (this.naturalLanguage.hasBlacklistedCharsInQuote(quote)) {
      return true;
    }

    if (
      quote.length >= Number.parseInt(process.env.VERSE_MAX_LENGTH || '30', 10)
    ) {
      return true;
    }

    return false;
  }
}
