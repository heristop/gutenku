import { promisify } from 'util';
import { unlink } from 'fs';
import { syllable } from 'syllable';
import { singleton } from 'tsyringe';
import { BookValue, ChapterValue, HaikuValue } from '../../shared/types';
import { MarkovEvaluatorService } from './MarkovEvaluatorService';
import NaturalLanguageService from './NaturalLanguageService';
import { PubSub } from 'graphql-subscriptions';
import CanvasService from './CanvasService';
import { IGenerator } from '../interfaces/IGenerator';
import BookService from '../../application/services/BookService';
import HaikuRepository from '../../infrastructure/repositories/HaikuRepository';
import ChapterRepository from '../../infrastructure/repositories/ChapterRepository';
import { PubSubService } from '../../infrastructure/services/PubSubService';
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

    private minCachedDocs: number;
    private ttl: number;
    private useCache: boolean;
    private theme: string;
    private executionTime: number;
    private filterWords: string[];
    private sentimentMinScore: number;
    private markovMinScore: number;

    private pubSub: PubSub;

    constructor(
        private readonly haikuRepository: HaikuRepository,
        private readonly chapterRepository: ChapterRepository,
        private readonly bookService: BookService,
        private readonly markovEvaluator: MarkovEvaluatorService,
        private readonly naturalLanguage: NaturalLanguageService,
        private readonly canvasService: CanvasService,
        private readonly pubSubService: PubSubService
    ) {
        this.filterWords = [];
        this.pubSub = this.pubSubService.instance;
    }

    configure(options?: {
        cache: {
            minCachedDocs: number,
            ttl: number,
            enabled: boolean,
        },
        score: {
            sentiment: number,
            markovChain: number,
        },
        theme: string
    }): HaikuGeneratorService {
        this.minCachedDocs = options?.cache.minCachedDocs ?? 100;
        this.useCache = options?.cache.enabled ?? false;
        this.ttl = options?.cache.ttl ?? 0;
        this.theme = options?.theme ?? 'watermark';
        this.filterWords = [];
        this.sentimentMinScore = options?.score.sentiment ?? null;
        this.markovMinScore = options?.score.markovChain ?? null;

        return this;
    }

    filter(filterWords: string[]): HaikuGeneratorService {
        this.filterWords = filterWords;

        return this;
    }

    async generate(): Promise<HaikuValue> {
        this.executionTime = new Date().getTime();

        let haiku = null;

        if (true === this.useCache) {
            haiku = await this.haikuRepository.extractFromCache(1, this.minCachedDocs);
        }

        await this.markovEvaluator.load();

        if (null === haiku) {
            haiku = await this.extractFromDb();
        }

        return haiku;
    }

    async appendImg(haiku: HaikuValue): Promise<HaikuValue> {
        this.canvasService.useTheme(this.theme);

        const imagePath = await this.canvasService.create(haiku);
        const image = await this.canvasService.read(imagePath);

        await promisify(unlink)(imagePath);

        return {
            ...haiku,
            'image': image.data.toString('base64'),
        }
    }

    async extractFromDb(): Promise<HaikuValue | null> {
        let haiku = null;
        let verses = [];
        let book = null;
        let chapter = null;
        let chapters = [];
        let i = 1;

        if (this.filterWords.length > 0) {
            chapters = await this.chapterRepository.getFilteredChapters(this.filterWords);
        }

        if (0 === chapters.length) {
            book = await this.bookService.selectRandomBook();
        }

        while (verses.length < 3) {
            if (chapters.length > 0) {
                const randomIndex = Math.floor(Math.random() * chapters.length);
                chapter = chapters[randomIndex];
                book = chapter.book;
            }

            if (0 === chapters.length) {
                chapter = this.selectRandomChapter(book);
            }

            verses = this.getVerses(chapter);

            if (this.filterWords.length > 0) {
                if (!this.verseContainsFilterWord(verses)) {
                    verses = [];
                }
            }

            // If the loop has iterated too many times without finding a suitable haiku, throw an exception
            if (i >= this.maxAttempts) {
                throw new MaxAttemptsError('max-attempts-error');
            }

            // If the maximum number of iterations within a selected book has been reached, select a new book
            if (0 === i % this.maxAttemptsInBook) {
                book = await this.bookService.selectRandomBook();
            }

            ++i;
        }

        haiku = this.buildHaiku(book, chapter, verses);

        await this.haikuRepository.createCacheWithTTL(haiku, this.ttl);

        return haiku;
    }

    getVerses(chapter: ChapterValue): string[] {
        const quotes = this.extractQuotes(chapter.content);

        return quotes.length > 0 ? this.selectHaikuVerses(quotes) : [];
    }

    verseContainsFilterWord(verses: string[]): boolean {
        return verses.some(verse =>
            this.filterWords.some(word => verse.includes(word))
        );
    }

    buildHaiku(book: BookValue, chapter: ChapterValue, verses: string[]): HaikuValue {
        const executionTime = (new Date().getTime() - this.executionTime) / 1000;

        return {
            'book': {
                'reference': book.reference,
                'title': book.title,
                'author': book.author
            },
            'chapter': chapter,
            'context': HaikuHelper.extractContextVerses(
                verses,
                chapter.content
            ),
            'verses': HaikuHelper.clean(verses),
            'rawVerses': verses,
            'cacheUsed': false,
            'executionTime': executionTime
        };
    }

    selectRandomChapter(book: BookValue): string {
        const index = Math.floor(Math.random() * book.chapters.length);

        return book.chapters[index.toString()];
    }

    extractQuotes(chapter: string): { quote: string, index: number }[] {
        const sentences = this.naturalLanguage.extractSentencesByPunctuation(chapter);
        const quotes = sentences.map((quote, index) => ({ quote, index }));

        return this.filterQuotesCountingSyllables(quotes.concat(quotes));
    }

    filterQuotesCountingSyllables(quotes: { quote: string, index: number }[]): { quote: string, index: number }[] {
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

        // Exclude filtered lists with less than MIN_QUOTES_COUNT quotes
        if (minQuotesCount && filteredQuotes.length < minQuotesCount) {
            return [];
        }

        return filteredQuotes;
    }

    selectHaikuVerses(quotes: { quote: string, index: number }[]): string[] {
        const syllableCounts = [5, 7, 5];

        const sentimentMinScore = this.sentimentMinScore ?? parseFloat(process.env.SENTIMENT_MIN_SCORE || '0');
        const markovMinScore = this.markovMinScore ?? parseFloat(process.env.MARKOV_MIN_SCORE || '0');

        const selectedVerses: { quote: string, index: number }[] = [];

        for (let i = 0; i < syllableCounts.length; i++) {
            const count = syllableCounts[i];

            const matchingQuotes = quotes.filter(({ quote, index }) => {
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

                console.log('quote', quote.split(' '));

                const sentimentScore = this.naturalLanguage.analyzeSentiment(quote);

                if (sentimentScore < sentimentMinScore) {
                    return false;
                }

                console.log('sentiment_score', sentimentScore, 'min', sentimentMinScore);

                if (selectedVerses.length > 0) {
                    const lastVerseIndex = selectedVerses[selectedVerses.length - 1].index;

                    // Ensure that the selected verse follows the last selected verse in the original text
                    if (index <= lastVerseIndex) {
                        return false;
                    }

                    const quotesToEvaluate = [
                        ...selectedVerses.map(verse => verse.quote),
                        quote
                    ];

                    const markovScore = this.markovEvaluator.evaluateHaiku(quotesToEvaluate);

                    if (markovScore < markovMinScore) {
                        return false;
                    }

                    console.log('markov_score', markovScore, 'min', markovMinScore);

                    this.pubSub.publish('QUOTE_GENERATED', {
                        quoteGenerated: quote,
                    });
                }

                return true;
            });

            if (matchingQuotes.length === 0) {
                return [];
            }

            // Select a random quote
            const randomIndex = Math.floor(Math.random() * matchingQuotes.length);
            const selectedQuote = matchingQuotes[randomIndex];

            selectedVerses.push(selectedQuote);

            // Remove the selected quote from the original quotes array
            quotes = quotes.filter(({ index }) => index !== selectedQuote.index);
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
