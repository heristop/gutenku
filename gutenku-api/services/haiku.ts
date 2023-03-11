import { promisify } from 'util';
import { unlink } from 'fs';
import { syllable } from 'syllable';
import Book from '../models/book';
import Canvas from './canvas';
import { BookValue, HaikuLogValue, HaikuValue } from '../src/types';
import Log from '../models/log';

const unlinkAsync = promisify(unlink);

export default {
    async generate(): Promise<HaikuValue> {
        let randomBook = await this.selectRandomBook();
        let randomChapter = null;
        let verses = [];
        let i = 0;

        while (verses.length < 3) {
            randomChapter = this.selectRandomChapter(randomBook);

            // eslint-disable-next-line
            verses = this.getVerses(randomChapter['content']);

            // Detect if Haiku had already been generated
            const logExists = await Log.findOne().where('haiku_verses').in(verses).exec();

            if (logExists) {
                verses = [];
            }

            if (0 === i % 100) {
                randomBook = await this.selectRandomBook();
            }

            ++i;
        }

        return {
            'book': {
                'reference': randomBook.reference,
                'title': randomBook.title,
                'author': randomBook.author
            },
            'chapter': randomChapter,
            'rawVerses': verses,
            'verses': this.clean(verses),
        }
    },

    async addImage(haiku: HaikuValue, keepImage: boolean): Promise<HaikuValue> {
        const imagePath = await Canvas.create(haiku.verses);

        const image = await Canvas.read(imagePath);

        if (true !== keepImage) {
            await unlinkAsync(imagePath);
        }

        return {
            ...haiku,
            'image': image.data.toString('base64'),
            'image_path': imagePath,
        }
    },

    async insertLog(db, haiku: HaikuValue): Promise<void> {
        const logsCollection = db.collection('logs');

        const logData: HaikuLogValue = {
            book_reference: haiku.book.reference,
            book_title: haiku.book.title,
            book_author: haiku.book.author,
            haiku_title: haiku.title,
            haiku_description: haiku.description,
            haiku_verses: haiku.verses,
            haiku_image: haiku.image_path,
            created_at: new Date(Date.now()).toISOString(),
        };

        await logsCollection.insertOne(logData);
    },

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
    },

    selectRandomChapter(book: { chapters: string | []; }): string {
        return book.chapters[Math.floor(Math.random() * book.chapters.length)];
    },

    getVerses(chapter: string): string[] {
        const minQuotesCount = process.env.MIN_QUOTES_COUNT || 8;
        const quotes = this.splitQuotes(chapter);
        const filteredQuotes = this.filterQuotes(quotes);

        // Exclude lists with less than MIN_QUOTES_COUNT quotes
        if (minQuotesCount && filteredQuotes.length < minQuotesCount) {
            return [];
        }

        const lines = this.selectHaikuLines(filteredQuotes);

        return lines;
    },

    splitQuotes(chapter: string): string[] {
        return chapter
            .replace(/([.?!,])\s*(?=[A-Za-z])/g, "$1|")
            .split("|");
    },

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
    },

    selectHaikuLines(quotes: string[]): string[] {
        const lines = [];
        const syllableCounts = process.env.SYLLABLE_COUNTS
            .split(',')
            .map((str) => Number(str));

        for (const count of syllableCounts) {
            const indexes = [];

            for (let i = 0; i < quotes.length; i++) {
                if (this.isQuoteInvalid(i, quotes[i])) {
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
    },

    isQuoteInvalid(linePosition: number, quote: string): boolean {
        if (0 === linePosition && this.isFirstQuoteInvalid(quote)) {
            return true;
        }

        if (this.hasUnexpectedCharsInQuote(quote)) {
            return true;
        }

        if (quote.length >= parseInt(process.env.VERSE_MAX_LENGTH)) {
            return true;
        }

        return false;
    },

    isFirstQuoteInvalid(quote: string): boolean {
        // First verse may not start with coordinating conjunction
        const conjunctionStartRegex = /^Or|And/;

        return conjunctionStartRegex.test(quote);
    },

    hasUnexpectedCharsInQuote(quote: string): boolean {
        const upperCaseCharsRegex = /^[A-Z\s!:.?]+$/;
        const lastWordsRegex = /Mr|Mrs|Or|And$/;
        const specialCharsRegex = /@|[0-9]|#|\[|\|+|\(|\)|"|“|”|--|_|\+|=|{|}|\]|\*%|\$|%|\n|;|~|&/;
        const lostLetter = /\b[A-Z]|[A-Z.]\b$/;

        return upperCaseCharsRegex.test(quote) ||
            lastWordsRegex.test(quote) ||
            specialCharsRegex.test(quote) ||
            lostLetter.test(quote);
    },

    countSyllables(quote: string): number {
        const words = quote.match(/\b\w+\b/g);

        if (!words) {
            return 0;
        }

        return words.reduce((count, word) => {
            return count + syllable(word);
        }, 0);
    },

    clean(verses: string[]): string[] {
        const newLineRegex = /[\n\r]/g;
        const whitespaceRegex = /\s+/g;

        return verses.map(verse => {
            verse = verse.trim()
                .replace(newLineRegex, ' ')
                .replace(whitespaceRegex, ' ');

            return verse.charAt(0).toUpperCase() + verse.slice(1);
        });
    },
}
