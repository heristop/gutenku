import { promisify } from 'util';
import { unlink } from 'fs';
import natural from 'natural';
import { Connection } from 'mongoose';
import { syllable } from 'syllable';
import CanvasService from './canvas';
import Book from '../models/book';
import { BookValue, HaikuValue } from '../types';
import { MarkovEvaluator } from './markovEvaluator';

const { PorterStemmer } = natural;

export interface GeneratorInterface {
    generate(): Promise<HaikuValue>;
}

export default class HaikuService implements GeneratorInterface {
    private db: Connection;
    private markovEvaluator: MarkovEvaluator;
    private minCachedDocs: number;
    private ttl: number;
    private skipCache: boolean;
    private theme: string;
    private executionTime: number;

    constructor(db?: Connection, options?: {
        cache: {
            minCachedDocs: number,
            ttl: number,
            disable: boolean,
        }, theme: string
    }) {
        this.db = db;
        this.minCachedDocs = options?.cache.minCachedDocs ?? 100;
        this.skipCache = options?.cache.disable ?? true;
        this.ttl = options?.cache.ttl ?? 0;
        this.theme = options?.theme ?? 'greentea';

        this.markovEvaluator = new MarkovEvaluator();
    }

    async generate(): Promise<HaikuValue> {
        this.executionTime = new Date().getTime();

        let haiku = await this.extractFromCache();

        if (null !== haiku) {
            return haiku;
        }

        let randomBook = await this.selectRandomBook();
        let randomChapter = null;
        let verses = [];
        let i = 1;

        await this.markovEvaluator.load();

        while (verses.length < 3) {
            randomChapter = this.selectRandomChapter(randomBook);

            // eslint-disable-next-line
            const quotes = this.extractQuotes(randomChapter['content']);

            if (quotes.length > 0) {
                verses = this.selectHaikuVerses(quotes);
            }
            
            // Change book after too much tries
            if (0 === i % 100) {
                randomBook = await this.selectRandomBook();
            }

            ++i;
        }

        const executionTime = (new Date().getTime() - this.executionTime) / 1000;

        haiku = {
            'book': {
                'reference': randomBook.reference,
                'title': randomBook.title,
                'author': randomBook.author
            },
            'chapter': randomChapter,
            'useCache': false,
            'rawVerses': verses,
            'verses': this.clean(verses),
            'executionTime': executionTime
        };

        await this.createCacheWithTTL(haiku);

        return haiku;
    }

    async appendImg(haiku: HaikuValue): Promise<HaikuValue> {
        const canvasService = new CanvasService(this.theme);

        const imagePath = await canvasService.create(haiku.verses);
        const image = await canvasService.read(imagePath);

        await promisify(unlink)(imagePath);

        return {
            ...haiku,
            'image': image.data.toString('base64'),
        }
    }

    async selectRandomBook(): Promise<BookValue> {
        const books = await Book
            .find({'chapters.id': { $ne: null }})
            .populate('chapters').exec();

        const randomBook = books[Math.floor(Math.random() * books.length)];

        if (!randomBook) {
            throw new Error('No book found');
        }

        if (0 === randomBook.chapters.length) {
            return this.selectRandomBook();
        }

        return randomBook;
    }

    async extractFromCache(size = 1): Promise<HaikuValue | null> {
        if (false === !!this.db) {
            return null;
        }

        const haikusCollection = this.db.collection('haikus');

        if (await haikusCollection.countDocuments() < this.minCachedDocs || this.skipCache) {
            return null;
        }

        const randomHaiku = await haikusCollection
            .aggregate([{ $sample: { size } }])
            .next();

        console.log('Extract from cache');

        return {
            'book': randomHaiku.book,
            'chapter': randomHaiku.chapter,
            'useCache': true,
            'verses': randomHaiku.verses,
            'rawVerses': randomHaiku.rawVerses,
        };
    }

    async createCacheWithTTL(haiku: HaikuValue): Promise<void> {
        if (false === !!this.db) {
            return;
        }

        const haikusCollection = this.db.collection('haikus');

        const haikuData = {
            ...haiku,
            createdAt: new Date(Date.now()).toISOString(),
            expireAt: new Date(Date.now() + this.ttl),
        };

        await haikusCollection.insertOne(haikuData);
    }

    selectRandomChapter(book: BookValue): string {
        const index = Math.floor(Math.random() * book.chapters.length);

        return book.chapters[index.toString()];
    }

    extractQuotes(chapter: string): string[] {
        const quotes = new natural.SentenceTokenizer().tokenize(chapter);

        return this.filterQuotesCountingSyllables(quotes);
    }

    filterQuotesCountingSyllables(quotes: string[]): string[] {
        const filteredQuotes =  quotes.filter((quote) => {
            const words = new natural.WordTokenizer().tokenize(quote);

            if (!words) {
                return false;
            }

            const syllableCount = words.reduce((count, word) => {
                return count + syllable(word);
            }, 0);

            return syllableCount === 5 || syllableCount === 7;
        }).map((quote) => {
            // Remove punctuation from selected quotes
            return quote.replace(/…$|\.\.\.$|\.$|,$|!$/, '');
        });      

        const minQuotesCount = parseInt(process.env.MIN_QUOTES_COUNT) || 20;

        // Exclude filered lists with less than MIN_QUOTES_COUNT quotes
        if (minQuotesCount && filteredQuotes.length < minQuotesCount) {
            return [];
        }

        return filteredQuotes;
    }

    selectHaikuVerses(quotes: string[]): string[] {
        const syllableCounts = [5, 7, 5];
        const selectedVerses = [];
                
        for (let i = 0; i < syllableCounts.length; i++) {
            const count = syllableCounts[i];
            const matchingQuotes = [];

            for (const quote of quotes) {
                // First verse
                if (0 === i && /^(and|but|or|of)/i.test(quote)) {
                    continue;
                }

                if (false === this.isQuoteInvalid(quote)) {
                    const syllableCount = this.countSyllables(quote);

                    if (syllableCount === count) {
                        const analyzer = new natural.SentimentAnalyzer('English', PorterStemmer, 'afinn');
                        const words = new natural.WordTokenizer().tokenize(quote);

                        const sentimentScore = analyzer.getSentiment(words);
                        const sentimentMinScore = parseFloat(process.env.SENTIMENT_MIN_SCORE || '0.2');

                        if (sentimentScore >= sentimentMinScore) {
                            console.log('words', words);
                            console.log('sentiment_score', sentimentScore, 'min', sentimentMinScore);

                            if (selectedVerses.length > 0) {
                                const quotesToEvaluate = [
                                    ...selectedVerses, 
                                    quote
                                ];

                                const markovScore = this.markovEvaluator.evaluateHaiku(quotesToEvaluate);
                                const markovMinScore = parseFloat(process.env.MARKOV_MIN_SCORE || '0.1');

                                if (markovScore >= markovMinScore) {
                                    console.log('markov_score', markovScore, 'min', markovMinScore);
                
                                    matchingQuotes.push({ quote, markovScore });
                                }

                                continue;
                            }

                            matchingQuotes.push({ quote });
                        }
                    }
                }

                quotes.splice(quotes.indexOf(quote), 1);
            }

            if (matchingQuotes.length === 0) {
                return [];
            }

            // Select a random quote with the highest sentiment score
            const randomIndex = Math.floor(Math.random() * matchingQuotes.length);
            const selectedQuote = matchingQuotes[randomIndex].quote;

            selectedVerses.push(selectedQuote);
        }

        return selectedVerses;
    }

    isQuoteInvalid(quote: string): boolean {
        if (this.hasUpperCaseWords(quote)) {
            return true;
        }

        if (this.hasBlacklistedCharsInQuote(quote)) {
            return true;
        }

        if (quote.length >= parseInt(process.env.VERSE_MAX_LENGTH || '30')) {
            return true;
        }

        return false;
    }

    hasUpperCaseWords(quote: string): boolean {
        return /^[A-Z\s!:.?]+$/g.test(quote);
    }

    hasBlacklistedCharsInQuote(quote: string): boolean {
        const lastWordsRegex = /(Mr|Mrs|Dr|or|and|of|St)$/i;
        const specialCharsRegex = /@|[0-9]|#|\[|\|\(|\)|"|“|”|‘|’|\/|--|:|,|_|—|\+|=|{|}|\]|\*|\$|%|\r|\n|;|~|&/g;
        const lostLetter = /\b[A-Z]\b$/;

        const regexList = [
            lastWordsRegex,
            specialCharsRegex,
            lostLetter,
        ];

        for (const regex of regexList) {
            if (regex.test(quote)) {
                return true;
            }
        }

        return false;
    }

    countSyllables(quote: string): number {
        const words = quote.match(/\b\w+\b/g);

        if (!words) {
            return 0;
        }

        return words.reduce((count, word) => {
            return count + syllable(word);
        }, 0);
    }

    clean(verses: string[]): string[] {
        const newLineRegex = /[\n\r]/g;
        const whitespaceRegex = /\s+/g;

        return verses.map(verse => {
            verse = verse.trim()
                .replace(newLineRegex, ' ')
                .replace(whitespaceRegex, ' ');

            return verse.charAt(0).toUpperCase() + verse.slice(1);
        });
    }
}
