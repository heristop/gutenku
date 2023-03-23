import { promisify } from 'util';
import { unlink } from 'fs';
import { syllable } from 'syllable';
import Book from '../models/book';
import CanvasService from './canvas';
import { BookValue, HaikuValue } from '../src/types';
import { Connection } from 'mongoose';

export interface GeneratorInterface {
    generate(): Promise<HaikuValue>;
}

export default class HaikuService implements GeneratorInterface {
    private db: Connection;
    private minCachedDocs: number;
    private ttl: number;
    private skipCache: boolean;

    constructor(db?: Connection, cache?: {
        minCachedDocs?: number,
        ttl?: number,
        skip?: boolean,
    }) {
        this.db = db;
        this.minCachedDocs = cache?.minCachedDocs;
        this.skipCache = cache?.skip;
        this.ttl = cache?.ttl;
    }

    async generate(): Promise<HaikuValue> {
        let haiku = await this.getFromCache();

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

            if (0 === i % 30) {
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
            'rawVerses': verses,
            'verses': this.clean(verses),
        };

        await this.createCacheWithTTL(haiku);

        return haiku;
    }

    async appendImg(haiku: HaikuValue): Promise<HaikuValue> {
        const imagePath = await CanvasService.create(haiku.verses);

        const image = await CanvasService.read(imagePath);

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

    async getFromCache(size = 1): Promise<HaikuValue | null> {
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

        console.log('Get from cache');

        return {
            'book': randomHaiku.book,
            'chapter': randomHaiku.chapter,
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
        const minQuotesCount = parseInt(process.env.MIN_QUOTES_COUNT) || 8;
        const quotes = this.splitQuotes(chapter);
        const filteredQuotes = this.filterQuotes(quotes);

        // Exclude lists with less than MIN_QUOTES_COUNT quotes
        if (minQuotesCount && filteredQuotes.length < minQuotesCount) {
            return [];
        }

        return this.selectHaikuLines(filteredQuotes);
    }

    splitQuotes(chapter: string): string[] {
        return chapter
            .replace(/([.?!,])\s*(?=[A-Za-z])/g, "$1|")
            .split("|");
    }

    filterQuotes(quotes: string[]): string[] {
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
            return quote.replace(/\.$|,$|!$/, "");
        });
    }

    selectHaikuLines(quotes: string[]): string[] {
        const lines = [];
        const syllableCounts = process.env.SYLLABLE_COUNTS
            .split(',')
            .map((str) => Number(str));

        for (const count of syllableCounts) {
            const indexes = [];

            for (let i = 0; i < quotes.length; i++) {
                if (this.isQuoteInvalid(quotes[i])) {
                    continue;
                }

                if (this.countSyllables(quotes[i]) === count) {
                    indexes.push(i);
                }
            }

            if (0 === indexes.length) {
                return [];
            }

            const index = indexes[Math.floor(Math.random() * indexes.length)];

            lines.push(quotes[index]);
            quotes.splice(index, 1);
        }

        return lines;
    }

    isQuoteInvalid(quote: string): boolean {
        if (this.hasUpperCaseChars(quote)) {
            return true;
        }

        if (this.hasUnexpectedCharsInQuote(quote)) {
            return true;
        }

        if (quote.length >= parseInt(process.env.VERSE_MAX_LENGTH)) {
            return true;
        }

        return false;
    }

    hasUpperCaseChars(quote: string): boolean {
        return /^[A-Z\s!:.?]+$/g.test(quote);
    }

    hasUnexpectedCharsInQuote(quote: string): boolean {
        const startWordsRegex = /^(Or|And)/i;
        const lastWordsRegex = /(Mr|Mrs|Or|And|St)$/i;
        const specialCharsRegex = /@|[0-9]|#|\[|\|\(|\)|"|“|”|--|:|,|_|—|\+|=|{|}|\]|\*|\$|%|\r|\n|;|~|&/g;

        const forbiddenExpressions = [
            'Translated',
            'Illustration',
            'On the other hand',
            'On the contrary',
            'copyright',
            'provide a copy',
        ];

        const forbiddenWordsRegex = new RegExp(`(${forbiddenExpressions.join('|')})`, 'i');
        const lostLetter = /\b[A-Z]\b$/;

        const regexList = [
            startWordsRegex,
            lastWordsRegex,
            specialCharsRegex,
            forbiddenWordsRegex,
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
