import Book from '../models/book';

export default {
    async generate() {
        const books = await Book.find().populate('chapters').exec();

        const randomBook = books[Math.floor(Math.random() * books.length)];
        const randomChapter = randomBook.chapters[Math.floor(Math.random() * randomBook.chapters.length)];
        const verses = this.extract(randomChapter["content"]);

        return {
            'book': {
                'title': randomBook.title,
                'author': randomBook.author
            },
            'chapter': randomChapter,
            'raw_verses': verses,
            'verses': this.clean(verses)
        }
    },

    extract(chapter: string) {
        const minLength = 5;
        let maxLength = 10;

        let verses: string[] = [];

        while (verses.length < 3) {
            verses = chapter.split(/[.?!]/);
            verses = Array.from(new Set(verses
                .filter((s) => s.trim().split(" ").length >= minLength && s.trim().split(" ").length < maxLength)
                .map((s) => s.trim().replace(/"/g, " "))));

            if (verses.length < 3) {
                maxLength += 1;
            }
        }

        return verses.slice(0, 3);
    },

    clean(verses: string[]) {
        return verses.map(verse => {
            verse = verse.trim().replace(/\n/g, " ");

            return verse.charAt(0).toUpperCase() + verse.slice(1);
        });
    },

    countSyllables(text) {
        // Remove punctuation and convert to lowercase
        const cleanText = text.replace(/[^a-zA-Z ]/g, "").toLowerCase();

        // Split text into words
        const words = cleanText.split(" ");

        let syllableCount = 0;

        // Iterate through each word and count syllables
        for (const word of words) {
            let wordSyllables = 0;

            // Check for vowels
            for (let i = 0; i < word.length; i++) {
                if (word[i].match(/[aeiouy]/)) {
                    wordSyllables++;
                }
            }

            // Special cases
            if (word.endsWith("e")) {
                wordSyllables--;
            }
            if (word.endsWith("le")) {
                wordSyllables++;
            }

            syllableCount += wordSyllables;
        }

        return syllableCount;
    }
}
