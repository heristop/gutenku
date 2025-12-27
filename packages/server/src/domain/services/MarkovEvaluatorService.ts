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

  public evaluateHaiku(haiku: string[]): number {
    if (haiku.length < 2) {
      return 0;
    }

    let totalScore = 0;

    for (let i = 0; i < haiku.length - 1; i++) {
      const score = this.markovChain.evaluateTransition(
        haiku[i].toLowerCase(),
        haiku[i + 1].toLowerCase(),
      );

      totalScore += score;
    }

    // Scale probability to align with sentiment score range (0.1 threshold)
    return (totalScore / (haiku.length - 1)) * 10;
  }

  /**
   * Evaluate haiku using trigram transitions for better phrase flow
   */
  public evaluateHaikuTrigrams(haiku: string[]): number {
    if (haiku.length < 2) {
      return 0;
    }

    let totalScore = 0;

    for (let i = 0; i < haiku.length - 1; i++) {
      const score = this.markovChain.evaluateTrigramTransition(
        haiku[i].toLowerCase(),
        haiku[i + 1].toLowerCase(),
      );

      totalScore += score;
    }

    // Scale probability to align with sentiment score range (0.1 threshold)
    return (totalScore / (haiku.length - 1)) * 10;
  }
}
