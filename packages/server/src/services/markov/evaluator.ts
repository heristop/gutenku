import { MarkovChain } from './chain';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class MarkovEvaluator {
    private markovChain: MarkovChain;

    constructor(markovChain: MarkovChain) {
        this.markovChain = markovChain;
    }

    public trainMarkovChain(text: string): MarkovEvaluator {
        this.markovChain.train(text);

        return this;
    }

    public async save(): Promise<void> {
        return this.markovChain.saveModel();
    }

    public async load(): Promise<void> {
        return this.markovChain.loadModel();
    }

    public evaluateHaiku(haiku: string[]): number {
        let totalScore = 0;

        for (let i = 0; i < haiku.length - 1; i++) {
            const score = this.markovChain.evaluateTransition(
                haiku[i].toLowerCase(),
                haiku[i + 1].toLowerCase()
            );

            totalScore += score;
        }

        return totalScore / (haiku.length - 1) / 100;
    }
}
