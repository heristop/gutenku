import Book from '../models/book';
import Canvas from './canvas';
import { syllable } from 'syllable';

export default {
    async generate() {
        const randomBook = await this.selectRandomBook();
        let randomChapter = null;
        let verses = [];

        while (verses.length < 3) {
            randomChapter = this.selectRandomChapter(randomBook);

            // eslint-disable-next-line
            verses = this.extract(randomChapter['content']);
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
            'image': null,
            'meaning': null
        }
    },

    async generateWithImage() {
        return this.addImage(await this.generate());
    },

    async addImage(haiku: { verses: string[]; }) {
        await Canvas.createPng(haiku.verses);
        await new Promise(r => setTimeout(r, 1000));

        const image = await Canvas.readPng();

        return {
            ...haiku,
            'image': image.data.toString('base64'),
        }
    },

    async selectRandomBook() {
        const books = await Book.find().populate('chapters').exec();

        const randomBook = books[Math.floor(Math.random() * books.length)];

        if (!randomBook) {
            throw 'No book found'
        }

        if (0 === randomBook.chapters.length) {
            throw `No chapter found for book "${randomBook.title}"`
        }

        return randomBook;
    },

    selectRandomChapter(book: { chapters: string | []; }) {
        return book.chapters[Math.floor(Math.random() * book.chapters.length)];
    },

    extract(chapter: string): string[] {
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
            if (/^[A-Z .,;-_?!:]+$/.test(sentence)) {
                return false;
            }

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
                .replace(/[\n”“"()[]]/g, ' ')
                .replace(/\s+/g, ' ');

            return verse.charAt(0).toUpperCase() + verse.slice(1);
        });
    }
}
