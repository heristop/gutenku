import { unlink } from 'fs';
import { syllable } from 'syllable';
import Book from '../models/book';
import Canvas from './canvas';
import { BookValue, HaikuLogValue, HaikuValue } from '../src/types';
import Log from '../models/log';

export default {
    async generate(): Promise<HaikuValue> {
        const randomBook = await this.selectRandomBook();
        let randomChapter = null;
        let verses = [];

        while (verses.length < 3) {
            randomChapter = this.selectRandomChapter(randomBook);

            // eslint-disable-next-line
            verses = this.getVerses(randomChapter['content']);

            // Detect if Haiku had already been generated
            const logExists = await Log.findOne().where('haiku_verses').in(verses).exec();

            if (logExists) {
                verses = [];
            }
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
            unlink(imagePath, (err: NodeJS.ErrnoException | null) => {
                if (err) {
                    throw err;
                }
            });
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
        const sentences = this.splitSentences(chapter);
        const filteredSentences = this.filterSentences(sentences);
        const lines = this.selectHaikuLines(filteredSentences);

        return lines;
    },

    splitSentences(chapter: string): string[] {
        return chapter.replace(/([.?!,])\s*(?=[A-Za-z])/g, "$1|").split("|");
    },

    filterSentences(sentences: string[]): string[] {
        return sentences.filter((sentence) => {
            const words = sentence.match(/\b\w+\b/g);

            if (!words) {
                return false;
            }

            const syllableCount = words.reduce((count, word) => {
                return count + syllable(word);
            }, 0);

            return syllableCount === 5 || syllableCount === 7;
        }).map((sentence) => {
            return sentence.replace(/!$/, "").replace(/\.$|,$/, "");
        });
    },

    selectHaikuLines(sentences: string[]): string[] {
        const lines = [];
        const syllableCounts = [5, 7, 5];

        for (const count of syllableCounts) {
            const index = sentences.findIndex((sentence) => {
                if (this.isSentenceInvalid(sentence)) {
                    return false;
                }

                return this.countSyllables(sentence) === count;
            });

            if (index === -1) {
                return [];
            }

            lines.push(sentences[index]);
            sentences.splice(index, 1);
        }

        return lines;
    },

    isSentenceInvalid(sentence: string): boolean {
        const upperCaseCharsRegex = /^[A-Z\s!:.?]+$/;
        const illustrationRegex = /\[Illustration/;

        return upperCaseCharsRegex.test(sentence) || illustrationRegex.test(sentence) || sentence.length >= 36;
    },

    countSyllables(sentence: string): number {
        const words = sentence.match(/\b\w+\b/g);

        if (!words) {
            return 0;
        }

        return words.reduce((count, word) => {
            return count + syllable(word);
        }, 0);
    },

    clean(verses: string[]): string[] {
        return verses.map(verse => {
            verse = verse
                .trim()
                .replace(/[\n\r]/g, ' ')
                .replace(/[--]/g, ' ')
                .replace(/["“”()]/g, '')
                .replace(/\s+/g, ' ');

            return verse.charAt(0).toUpperCase() + verse.slice(1);
        });
    },
}
