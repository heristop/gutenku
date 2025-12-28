import fs from 'node:fs/promises';
import NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('markov');
import { inject, singleton } from 'tsyringe';

const FANBOYS_LIST = ['for', 'and', 'nor', 'but', 'or', 'yet', 'so'];

@singleton()
export class MarkovChainService {
  private bigrams: Map<string, Map<string, number>>;
  private trigrams: Map<string, Map<string, number>>;
  private totalBigrams: number;
  private totalTrigrams: number;
  private loaded = false;

  constructor(
    @inject(NaturalLanguageService)
    private readonly naturalLanguage: NaturalLanguageService,
  ) {
    this.bigrams = new Map();
    this.trigrams = new Map();
    this.totalBigrams = 0;
    this.totalTrigrams = 0;
  }

  public train(text: string): void {
    const sentences = this.naturalLanguage.extractSentences(
      text.replaceAll('\n', ' '),
    );

    for (const sentence of sentences) {
      const words = this.naturalLanguage.extractWords(sentence);

      const wordList: string[] = [];
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

      for (let i = 0; i < wordList.length - 2; i++) {
        const key = `${wordList[i]} ${wordList[i + 1]}`;
        const next = wordList[i + 2];

        if (!this.trigrams.has(key)) {
          this.trigrams.set(key, new Map());
        }

        const transitions = this.trigrams.get(key);

        if (transitions) {
          transitions.set(next, (transitions.get(next) || 0) + 1);
        }

        this.totalTrigrams++;
      }
    }
  }

  public evaluateTransition(from: string, to: string): number {
    const fromWords = this.naturalLanguage.extractWords(from);
    const toWords = this.naturalLanguage.extractWords(to);

    if (fromWords.length === 0 || toWords.length === 0) {
      return 0;
    }

    const lastWordFrom = fromWords.at(-1);
    const firstWordTo = toWords[0];

    const transitions = this.bigrams.get(lastWordFrom);

    if (transitions) {
      const count = transitions.get(firstWordTo);

      if (count) {
        const totalTransitions = [...transitions.values()].reduce(
          (a, b) => a + b,
          0,
        );
        return count / totalTransitions;
      }
    }

    return 0;
  }

  public evaluateTrigramTransition(from: string, to: string): number {
    const fromWords = this.naturalLanguage.extractWords(from);
    const toWords = this.naturalLanguage.extractWords(to);

    if (fromWords.length < 2 || toWords.length === 0) {
      return 0;
    }

    const key = `${fromWords.at(-2)} ${fromWords.at(-1)}`;
    const firstWordTo = toWords[0];

    const transitions = this.trigrams.get(key);

    if (transitions) {
      const count = transitions.get(firstWordTo);

      if (count) {
        const totalTransitions = [...transitions.values()].reduce(
          (a, b) => a + b,
          0,
        );
        return count / totalTransitions;
      }
    }

    return 0;
  }

  public async saveModel(): Promise<boolean> {
    const data = JSON.stringify({
      bigrams: Array.from(this.bigrams, ([key, value]) => [key, [...value]]),
      trigrams: Array.from(this.trigrams, ([key, value]) => [key, [...value]]),
      totalBigrams: this.totalBigrams,
      totalTrigrams: this.totalTrigrams,
    });

    try {
      await fs.writeFile('./data/markov_model.json', data, 'utf8');
      log.info('Model saved successfully');
      return true;
    } catch (error) {
      log.error({ err: error }, 'Error saving model');
      return false;
    }
  }

  public async loadModel(): Promise<boolean> {
    if (this.loaded && this.bigrams.size > 0) {
      return true;
    }

    try {
      const data = await fs.readFile('./data/markov_model.json', 'utf8');
      const jsonData = JSON.parse(data);

      this.bigrams = new Map(
        jsonData.bigrams.map(([key, value]: [string, [string, number][]]) => [
          key,
          new Map(value),
        ]),
      );
      this.totalBigrams = jsonData.totalBigrams;

      if (jsonData.trigrams) {
        this.trigrams = new Map(
          jsonData.trigrams.map(
            ([key, value]: [string, [string, number][]]) => [
              key,
              new Map(value),
            ],
          ),
        );
        this.totalTrigrams = jsonData.totalTrigrams || 0;
      }

      this.loaded = true;
      return true;
    } catch (error) {
      log.error({ err: error }, 'Error loading model');
      return false;
    }
  }
}
