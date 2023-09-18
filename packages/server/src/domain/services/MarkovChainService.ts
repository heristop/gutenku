import fs from 'fs/promises';
import NaturalLanguageService from './NaturalLanguageService';
import { singleton } from 'tsyringe';

const FANBOYS_LIST = ['for', 'and', 'nor', 'but', 'or', 'yet', 'so'];

@singleton()
export class MarkovChainService {
    private bigrams: Map<string, Map<string, number>>;
    private totalBigrams: number;

    constructor(private readonly naturalLanguage: NaturalLanguageService) {
        this.bigrams = new Map();
        this.totalBigrams = 0;
        this.naturalLanguage = naturalLanguage;
    }

    public train(text: string): void {
        const sentences = this.naturalLanguage.extractSentences(text.replaceAll(/\n/g, ' '));

        for (const sentence of sentences) {
            const words = this.naturalLanguage.extractWords(sentence);

            const wordList = [];
            words.forEach((word: string) => {
                if (!FANBOYS_LIST.includes(word.toLowerCase())) {
                    wordList.push(word);
                }
            });

            for (let i = 0; i < wordList.length - 1; i++) {
                const from = wordList[i];
                const to = wordList[i + 1];

                if (!this.bigrams.has(from)) {
                    this.bigrams.set(from, new Map());
                }

                const transitions = this.bigrams.get(from);

                if (transitions) {
                    transitions.set(to, (transitions.get(to) || 0) + 1);
                }

                this.totalBigrams++;
            }
        }
    }

    public evaluateTransition(from: string, to: string): number {
        const fromWords = this.naturalLanguage.extractWords(from);
        const toWords = this.naturalLanguage.extractWords(to);

        if (fromWords.length === 0 || toWords.length === 0) {
            return 0;
        }

        const lastWordFrom = fromWords[fromWords.length - 1];
        const firstWordTo = toWords[0];

        const transitions = this.bigrams.get(lastWordFrom);

        if (transitions) {
            const count = transitions.get(firstWordTo);

            if (count) {
                return count / (lastWordFrom.length + toWords.length);
            }
        }

        return 0;
    }

    public evaluateWords(from: string, to: string): number {
        const fromWords = this.naturalLanguage.extractWords(from);
        const toWords = this.naturalLanguage.extractWords(to);

        let totalScore = 0;
        let totalCount = 0;

        for (const fromWord of fromWords) {
            for (const toWord of toWords) {
                const transitions = this.bigrams.get(fromWord);

                if (transitions) {
                    const count = transitions.get(toWord);

                    if (count) {
                        totalScore += count / 1000;
                        totalCount++;
                    }
                }
            }
        }

        return totalCount > 0 ? totalScore / totalCount : 0;
    }

    public async saveModel(): Promise<void> {
        const data = JSON.stringify({
            bigrams: Array.from(this.bigrams, ([key, value]) => [key, Array.from(value)]),
            totalBigrams: this.totalBigrams,
        });

        try {
            await fs.writeFile('./data/markov_model.json', data, 'utf8');
            console.log('Model saved with success.');
        } catch (error) {
            console.error(`Error on model save: ${error}`);
        }
    }

    public async loadModel(): Promise<void> {
        try {
            const data = await fs.readFile('./data/markov_model.json', 'utf8');
            const jsonData = JSON.parse(data);

            this.bigrams = new Map(jsonData.bigrams.map(([key, value]: [string, [string, number][]]) => [key, new Map(value)]));
            this.totalBigrams = jsonData.totalBigrams;
        } catch (error) {
            console.error(`Error on model load: ${error}`);
        }
    }
}
