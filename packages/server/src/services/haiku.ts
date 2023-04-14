import { promisify } from 'util';
import { unlink } from 'fs';
import natural from 'natural';
import { Connection } from 'mongoose';
import { syllable } from 'syllable';
import CanvasService from './canvas';
import Book from '../models/book';
import { BookValue, HaikuValue } from '../types';

const { PorterStemmer } = natural;

export interface GeneratorInterface {
    generate(): Promise<HaikuValue>;
}

export default class HaikuService implements GeneratorInterface {
    private db: Connection;
    private minCachedDocs: number;
    private ttl: number;
    private skipCache: boolean;
    private theme: string;

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
    }

    async generate(): Promise<HaikuValue> {
        let haiku = await this.extractFromCache();

        if (null !== haiku) {
            return haiku;
        }

        let randomBook = await this.selectRandomBook();
        let randomChapter = null;
        let verses = [];
        let i = 0;

        while (verses.length < 3) {
            randomChapter = this.selectRandomChapter(randomBook);

            // eslint-disable-next-line
            verses = this.getVerses(randomChapter['content']);

            // Failed to find 3 verses in the selected book after 50 tries
            if (0 === i % 50) {
                randomBook = await this.selectRandomBook();
            }

            ++i;
        }

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
        const books = await Book.find().populate('chapters').exec();

        const randomBook = books[Math.floor(Math.random() * books.length)];

        if (!randomBook) {
            throw new Error('No book found');
        }

        if (0 === randomBook.chapters.length) {
            throw new Error(`No chapter found for book "${randomBook.title}"`);
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

        console.log('Exract from cache');

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

    getVerses(chapter: string): string[] {
        const minQuotesCount = parseInt(process.env.MIN_QUOTES_COUNT) || 12;
        const quotes = this.extractQuotes(chapter);
        const filteredQuotes = this.filterQuotesCountingSyllables(quotes);

        // Exclude lists with less than MIN_QUOTES_COUNT quotes
        if (minQuotesCount && filteredQuotes.length < minQuotesCount) {
            return [];
        }

        return this.selectHaikuLines(filteredQuotes);
    }

    extractQuotes(chapter: string): string[] {
        return new natural.SentenceTokenizer().tokenize(chapter);
    }

    filterQuotesCountingSyllables(quotes: string[]): string[] {
        return quotes.filter((quote) => {
            const words = quote.match(/\b\w+\b/g);

            if (!words) {
                return false;
            }

            const syllableCount = words.reduce((count, word) => {
                return count + syllable(word);
            }, 0);

            return syllableCount === 5 || syllableCount === 7;
        }).map((quote) => {
            return quote.replace(/\.\.\.|\.$|,$|!$/, "");
        });
    }

    selectHaikuLines(quotes: string[]): string[] {
        const syllableCounts = [5, 7, 5];
        const haikuLines = [];

        for (const count of syllableCounts) {
            const matchingQuotes = [];

            for (const quote of quotes) {
                if (this.isQuoteInvalid(quote)) {
                    quotes.splice(quotes.indexOf(quote), 1);

                    continue;
                }

                const syllableCount = this.countSyllables(quote);

                if (syllableCount === count) {
                    const analyzer = new natural.SentimentAnalyzer('English', PorterStemmer, 'afinn');
                    const tokenizer = new natural.WordTokenizer();
                    const words = tokenizer.tokenize(quote);

                    const sentiment = analyzer.getSentiment(words);

                    if (sentiment < parseFloat(process.env.SENTIMENT_SCORE || '0.2')) {
                        quotes.splice(quotes.indexOf(quote), 1);

                        continue;
                    }

                    console.log('words', words);
                    console.log('sentiment_score', sentiment);

                    matchingQuotes.push({ quote, sentiment });
                }
            }

            if (matchingQuotes.length === 0) {
                return [];
            }

            // Sort matching quotes by sentiment score
            matchingQuotes.sort((a, b) => a.sentiment - b.sentiment);

            // Select a random quote with the highest sentiment score
            const randomIndex = Math.floor(Math.random() * matchingQuotes.length);
            const selectedQuote = matchingQuotes[randomIndex].quote;

            haikuLines.push(selectedQuote);
            quotes.splice(quotes.indexOf(selectedQuote), 1);
        }

        return haikuLines;
    }


    isQuoteInvalid(quote: string): boolean {
        if (this.hasUpperCaseChars(quote)) {
            return true;
        }

        if (this.hasForbiddenCharsInQuote(quote)) {
            return true;
        }

        if (quote.length >= parseInt(process.env.VERSE_MAX_LENGTH || '30')) {
            return true;
        }

        return false;
    }

    hasUpperCaseChars(quote: string): boolean {
        return /^[A-Z\s!:.?]+$/g.test(quote);
    }

    hasForbiddenCharsInQuote(quote: string): boolean {
        const startWordsRegex = /^(Or|And)/i;
        const lastWordsRegex = /(Mr|Mrs|Dr|Or|And|St)$/i;
        const specialCharsRegex = /@|[0-9]|#|\[|\|\(|\)|"|“|”|‘|’|\/|--|:|,|_|—|\+|=|{|}|\]|\*|\$|%|\r|\n|;|~|&/g;
        const lostLetter = /\b[A-Z]\b$/;

        const regexList = [
            startWordsRegex,
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
