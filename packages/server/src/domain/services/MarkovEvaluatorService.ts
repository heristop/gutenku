import { MarkovChainService } from '~/domain/services/MarkovChainService';
import { inject, singleton } from 'tsyringe';

@singleton()
export class MarkovEvaluatorService {
  constructor(
    @inject(MarkovChainService)
    private readonly markovChain: MarkovChainService,
  ) {}

  public trainMarkovChain(text: string): MarkovEvaluatorService {
    this.markovChain.train(text);

    return this;
  }

  public async save(): Promise<boolean> {
    return this.markovChain.saveModel();
  }

  public async load(): Promise<boolean> {
    return this.markovChain.loadModel();
  }

  public importTrainingData(data: {
    bigrams: Map<string, Map<string, number>>;
    trigrams: Map<string, Map<string, number>>;
    bigramTotals: Map<string, number>;
    trigramTotals: Map<string, number>;
    totalBigrams: number;
    totalTrigrams: number;
    vocabulary: Set<string>;
  }): void {
    this.markovChain.importTrainingData(data);
  }

  public isReady(): boolean {
    return this.markovChain.isModelLoaded();
  }

  public getStats(): {
    bigrams: number;
    trigrams: number;
    vocabulary: number;
    totalBigrams: number;
    totalTrigrams: number;
  } {
    return this.markovChain.getStats();
  }

  public evaluateHaiku(haiku: string[]): number {
    if (haiku.length < 2) {
      return 0;
    }

    const lowerHaiku = haiku.map((v) => v.toLowerCase());
    let totalScore = 0;

    for (let i = 0; i < lowerHaiku.length - 1; i++) {
      const score = this.markovChain.evaluateTransition(
        lowerHaiku[i],
        lowerHaiku[i + 1],
      );

      totalScore += score;
    }

    return (totalScore / (lowerHaiku.length - 1)) * 10;
  }

  public evaluateHaikuTrigrams(haiku: string[]): number {
    if (haiku.length < 2) {
      return 0;
    }

    const lowerHaiku = haiku.map((v) => v.toLowerCase());
    let totalScore = 0;

    for (let i = 0; i < lowerHaiku.length - 1; i++) {
      const score = this.markovChain.evaluateTrigramTransition(
        lowerHaiku[i],
        lowerHaiku[i + 1],
      );

      totalScore += score;
    }

    return (totalScore / (lowerHaiku.length - 1)) * 10;
  }
}
