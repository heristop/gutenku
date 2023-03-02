import { unlink } from 'fs';
import { syllable } from 'syllable';
import Book from '../models/book';
import Canvas from './canvas';
import { BookValue, HaikuLogValue, HaikuValue } from '../src/types';
import Log from '../models/log';

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
        const minSentencesCount = process.env.MIN_SENTENCES_COUNT;
        const sentences = this.splitSentences(chapter);
        const filteredSentences = this.filterSentences(sentences);

        // Exclude lists with less than MIN_SENTENCES_COUNT sentences
        if (minSentencesCount && filteredSentences.length < minSentencesCount) {
            return [];
        }

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
        const syllableCounts = process.env.SYLLABLE_COUNTS.split(',').map((str) => Number(str));

        for (const count of syllableCounts) {
            const indexes = [];

            for (let i = 0; i < sentences.length; i++) {
                if (this.isSentenceInvalid(sentences[i])) {
                    continue;
                }

                if (this.countSyllables(sentences[i]) === count) {
                    indexes.push(i);
                }
            }

            if (0 === indexes.length) {
                return [];
            }

            const index = indexes[Math.floor(Math.random() * indexes.length)];

            lines.push(sentences[index]);
            sentences.splice(index, 1);
        }

        return lines;
    },

    isSentenceInvalid(sentence: string): boolean {
        const upperCaseCharsRegex = /^[A-Z\s!:.?]+$/;
        const illustrationRegex = /\[Illustration/;
        const genderEndRegex = /[Mr|Mrs]$/;

        return upperCaseCharsRegex.test(sentence) ||
            illustrationRegex.test(sentence) ||
            genderEndRegex.test(sentence) ||
            sentence.length >= parseInt(process.env.VERSE_MAX_LENGTH);
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
                .replace(/[--]|['_']/g, ' ')
                .replace(/["“”()]/g, '')
                .replace(/\s+/g, ' ');

            return verse.charAt(0).toUpperCase() + verse.slice(1);
        });
    },
}
