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
        haiku[i + 1].toLowerCase(),
      );

      totalScore += score;
    }

    return totalScore / (haiku.length - 1) / 100;
  }
}
