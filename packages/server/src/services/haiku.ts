import { promisify } from 'util';
import { unlink } from 'fs';
import { Connection } from 'mongoose';
import { syllable } from 'syllable';
import CanvasService from './canvas';
import Book from '../models/book';
import { BookValue, HaikuValue, ContextVerses } from '../types';
import { MarkovEvaluator } from './markov/evaluator';
import NaturalLanguageService from './natural';
import { PubSub } from 'graphql-subscriptions';

export interface IGenerator {
    generate(): Promise<HaikuValue>;
}

export default class HaikuService implements IGenerator {
    private readonly maxTries = 50;

    private db: Connection;
    private pubsub: PubSub;
    private markovEvaluator: MarkovEvaluator;
    private naturalLanguage: NaturalLanguageService;
    private minCachedDocs: number;
    private ttl: number;
    private skipCache: boolean;
    private theme: string;
    private executionTime: number;

    constructor(db?: Connection, pubsub?: PubSub, options?: {
        cache: {
            minCachedDocs: number,
            ttl: number,
            disable: boolean,
        }, theme: string
    }) {
        this.db = db;
        this.pubsub = pubsub;
        this.minCachedDocs = options?.cache.minCachedDocs ?? 100;
        this.skipCache = options?.cache.disable ?? true;
        this.ttl = options?.cache.ttl ?? 0;
        this.theme = options?.theme ?? 'watermark';

        this.markovEvaluator = new MarkovEvaluator();
        this.naturalLanguage = new NaturalLanguageService();
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
            if (0 === i % this.maxTries) {
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
            'verses': this.clean(verses),
            'rawVerses': verses,
            'context': this.extractContextVerses(
                verses, 
                randomChapter.content
            ),
            'executionTime': executionTime
        };

        await this.createCacheWithTTL(haiku);

        return haiku;
    }

    async appendImg(haiku: HaikuValue): Promise<HaikuValue> {
        const canvasService = new CanvasService(this.theme);

        const imagePath = await canvasService.create(haiku);
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

    extractQuotes(chapter: string): {quote: string, index: number}[] {
        const sentences = this.naturalLanguage.extractSentencesByPunctuation(chapter);
        const quotes = sentences.map((quote, index) => ({quote, index}));
    
        return this.filterQuotesCountingSyllables(quotes.concat(quotes));
    }
    
    filterQuotesCountingSyllables(quotes: {quote: string, index: number}[]): {quote: string, index: number}[] {
        const filteredQuotes = quotes.filter(({quote}) => {
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

    selectHaikuVerses(quotes: {quote: string, index: number}[]): string[] {
        const syllableCounts = [5, 7, 5];
        const sentimentMinScore = parseFloat(process.env.SENTIMENT_MIN_SCORE || '0');
        const markovMinScore = parseFloat(process.env.MARKOV_MIN_SCORE || '0');
        
        const selectedVerses: {quote: string, index: number}[] = [];
    
        for (let i = 0; i < syllableCounts.length; i++) {
            const count = syllableCounts[i];
    
            const matchingQuotes = quotes.filter(({quote, index}) => {
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

                this.pubsub.publish('QUOTE_GENERATED', {
                    quoteGenerated: quote,
                });

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
            quotes = quotes.filter(({index}) => index !== selectedQuote.index);
        }
    
        return selectedVerses.map(({quote}) => quote);
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

    extractContextVerses(
        verses: string[],
        chapter: string
    ): ContextVerses[] {
        return verses.map(verse => {
            return this.findContext(
                chapter.replaceAll(/\n/g, ' '), 
                verse.replaceAll(/\n/g, ' ')
            );
        });
    }

    findContext(text, substring, numWords = 5, numSentences = 2) {
        const sentences = text.split(/(?<=[.,;!?])\s+/);

        const index = text.indexOf(substring);

        if (index === -1) {
            return null;
        }

        const wordsBeforeArray = text.slice(0, index).split(" ").slice(-numWords);
        const wordsAfterArray = text.slice(index + substring.length).split(" ").slice(0, numWords);
        const wordsBefore = wordsBeforeArray.join(" ");
        const wordsAfter = wordsAfterArray.join(" ");

        const sentenceIndexBefore = sentences.findIndex(sentence => sentence.includes(wordsBeforeArray[0]));
        const sentenceIndexAfter = sentences.findIndex(sentence => sentence.includes(wordsAfterArray[wordsAfterArray.length - 1]));

        const sentencesBefore = sentences.slice(Math.max(0, sentenceIndexBefore - numSentences + 1), sentenceIndexBefore + 1);
        const sentencesAfter = sentences.slice(sentenceIndexAfter, sentenceIndexAfter + numSentences);
        const sentenceBefore = sentencesBefore.join(" ").replace(substring, "").trim();
        const sentenceAfter = sentencesAfter.join(" ").replace(substring, "").trim();
    
        return {
            wordsBefore,
            sentenceBefore,
            wordsAfter,
            sentenceAfter
        };
    }

    clean(verses: string[]): string[] {
        const newLineRegex = /[\n\r]/g;
        const whitespaceRegex = /\s+/g;

        return verses.map(verse => {
            verse = verse.trim()
                .replaceAll(newLineRegex, ' ')
                .replaceAll(whitespaceRegex, ' ')
                .replaceAll(/^'|'$|\.\.\.$|\.$\.$|\.$|,$|!$|;$|\?$/g, '');

            return verse.charAt(0).toUpperCase() + verse.slice(1);
        });
    }
}
