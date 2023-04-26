import natural from 'natural';
import fs from 'fs/promises';

export class MarkovChain {
    private bigrams: Map<string, Map<string, number>>;
    private totalBigrams: number;

    constructor() {
        this.bigrams = new Map();
        this.totalBigrams = 0;
    }

    public train(text: string): void {
        const sentences = this.extractSentences(text);

        for (const sentence of sentences) {
            const words = new natural.WordTokenizer().tokenize(sentence);

            for (let i = 0; i < words.length - 1; i++) {
                const from = words[i];
                const to = words[i + 1];

                if (this.isExcluded(from) || this.isExcluded(to)) {
                    continue;
                }

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
        const fromWords = new natural.WordTokenizer().tokenize(from);
        const toWords = new natural.WordTokenizer().tokenize(to);

        if (fromWords.length === 0 || toWords.length === 0) {
            return 0;
        }

        const lastWordFrom = fromWords[fromWords.length - 1];
        const firstWordTo = toWords[0];

        const transitions = this.bigrams.get(lastWordFrom);

        if (transitions) {
            const count = transitions.get(firstWordTo);

            if (count) {
                return count / 100;
            }
        }

        return 0;
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

    private extractSentences(text: string): string[] {
        return new natural.SentenceTokenizer().tokenize(text.toLowerCase());
    }

    private isExcluded(word: string): boolean {
        // Exclude words with one or several capitalized letters
        if (/(?=.*[A-Z])/g.test(word)) {
            return true;
        }

        return false;
    }

}
