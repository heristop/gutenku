import Book from '../models/book';
import Canvas from './canvas';

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

        await new Promise(r => setTimeout(r, 500));

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
        const sentences = chapter.replace(/([.?!,])\s*(?=[A-Za-z])/g, "$1|").split("|");
        const filteredSentences = sentences.filter((sentence) => {
            if (/^[A-Z]+$/.test(sentence)) {
                return false;
            }

            const words = sentence.match(/\b\w+\b/g);

            if (!words) {
                return false;
            }

            const syllableCount = words.reduce((count, word) => {
                const syllables = word.toLowerCase().match(/[aeiouy]{1,2}/g);

                return count + (syllables ? syllables.length : 0);
            }, 0);

            return syllableCount === 5 || syllableCount === 7;
        });

        if (filteredSentences.length < 3) {
            return [];
        }

        const lines = [];

        for (let i = 0; i < 3; i++) {
            const index = Math.floor(Math.random() * filteredSentences.length);
            const line = filteredSentences[index].replace(/!$/, "").replace(/\.$/, "").replace(/,$/, "");
            lines.push(line);
            filteredSentences.splice(index, 1);
        }

        return lines;
    },

    clean(verses: string[]): string[] {
        return verses.map(verse => {
            verse = verse.trim().replace(/[\n”“"]/g, ' ');
            verse = verse.replace('  ', ' ');

            return verse.charAt(0).toUpperCase() + verse.slice(1);
        });
    }
}
