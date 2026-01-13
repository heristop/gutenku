import fs from 'node:fs/promises';
import NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('markov');
import { inject, singleton } from 'tsyringe';

const FANBOYS_SET = new Set(['for', 'and', 'nor', 'but', 'or', 'yet', 'so']);

// Smoothing constant for Laplace smoothing
const SMOOTHING_ALPHA = 0.01;

@singleton()
export class MarkovChainService {
  private bigrams: Map<string, Map<string, number>>;
  private trigrams: Map<string, Map<string, number>>;
  // Cache transition totals to avoid repeated array reductions
  private bigramTotals: Map<string, number>;
  private trigramTotals: Map<string, number>;
  private totalBigrams: number;
  private totalTrigrams: number;
  private vocabulary: Set<string>;
  private loaded = false;

  constructor(
    @inject(NaturalLanguageService)
    private readonly naturalLanguage: NaturalLanguageService,
  ) {
    this.bigrams = new Map();
    this.trigrams = new Map();
    this.bigramTotals = new Map();
    this.trigramTotals = new Map();
    this.totalBigrams = 0;
    this.totalTrigrams = 0;
    this.vocabulary = new Set();
  }

  public train(text: string): void {
    const sentences = this.naturalLanguage.extractSentences(
      text.replaceAll('\n', ' '),
    );

    for (const sentence of sentences) {
      const words = this.naturalLanguage.extractWords(sentence);

      const wordList: string[] = [];
      words.forEach((word: string) => {
        const lowerWord = word.toLowerCase();
        if (!FANBOYS_SET.has(lowerWord)) {
          wordList.push(word); // Keep original case
          this.vocabulary.add(lowerWord);
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
          // Update cached total for this key
          this.bigramTotals.set(from, (this.bigramTotals.get(from) || 0) + 1);
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
          // Update cached total for this key
          this.trigramTotals.set(key, (this.trigramTotals.get(key) || 0) + 1);
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
        // Use cached total instead of array reduction
        const totalTransitions = this.bigramTotals.get(lastWordFrom) || 0;
        return totalTransitions > 0 ? count / totalTransitions : 0;
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
        // Use cached total instead of array reduction
        const totalTransitions = this.trigramTotals.get(key) || 0;
        return totalTransitions > 0 ? count / totalTransitions : 0;
      }
    }

    return 0;
  }

  /**
   * Evaluate bigram transition with Laplace smoothing.
   * Prevents zero probability for unseen transitions.
   */
  public evaluateTransitionSmoothed(from: string, to: string): number {
    const fromWords = this.naturalLanguage.extractWords(from);
    const toWords = this.naturalLanguage.extractWords(to);
    if (fromWords.length === 0 || toWords.length === 0) {
      return SMOOTHING_ALPHA / (SMOOTHING_ALPHA * this.vocabulary.size || 1);
    }

    const lastWordFrom = fromWords.at(-1)?.toLowerCase();
    const firstWordTo = toWords[0].toLowerCase();

    const transitions = this.bigrams.get(lastWordFrom);
    const totalTransitions = this.bigramTotals.get(lastWordFrom) || 0;
    const vocabSize = this.vocabulary.size || 1;

    const count = transitions?.get(firstWordTo) || 0;

    // Laplace smoothing: (count + alpha) / (total + alpha * vocabSize)
    return (count + SMOOTHING_ALPHA) / (totalTransitions + SMOOTHING_ALPHA * vocabSize);
  }

  /**
   * Evaluate trigram transition with Laplace smoothing.
   */
  public evaluateTrigramTransitionSmoothed(from: string, to: string): number {
    const fromWords = this.naturalLanguage.extractWords(from);
    const toWords = this.naturalLanguage.extractWords(to);
    if (fromWords.length < 2 || toWords.length === 0) {
      return SMOOTHING_ALPHA / (SMOOTHING_ALPHA * this.vocabulary.size || 1);
    }

    const key = `${fromWords.at(-2)?.toLowerCase()} ${fromWords.at(-1)?.toLowerCase()}`;
    const firstWordTo = toWords[0].toLowerCase();

    const transitions = this.trigrams.get(key);
    const totalTransitions = this.trigramTotals.get(key) || 0;
    const vocabSize = this.vocabulary.size || 1;

    const count = transitions?.get(firstWordTo) || 0;

    return (count + SMOOTHING_ALPHA) / (totalTransitions + SMOOTHING_ALPHA * vocabSize);
  }

  /**
   * Backoff strategy: tries bigrams first, falls back to trigrams when bigram returns 0.
   * Uses unsmoothed probabilities for strict filtering.
   */
  public evaluateWithBackoff(from: string, to: string): number {
    const bigramScore = this.evaluateTransition(from, to);

    if (bigramScore > 0) {
      return bigramScore;
    }
    // Fallback to trigram when bigram has no data
    return this.evaluateTrigramTransition(from, to);
  }

  public async saveModel(): Promise<boolean> {
    const data = JSON.stringify({
      bigrams: Array.from(this.bigrams, ([key, value]) => [key, [...value]]),
      trigrams: Array.from(this.trigrams, ([key, value]) => [key, [...value]]),
      bigramTotals: [...this.bigramTotals],
      trigramTotals: [...this.trigramTotals],
      totalBigrams: this.totalBigrams,
      totalTrigrams: this.totalTrigrams,
      vocabulary: [...this.vocabulary],
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

      // Load or compute bigram totals (backward compatible)
      if (jsonData.bigramTotals) {
        this.bigramTotals = new Map(jsonData.bigramTotals);
      } else {
        this.computeBigramTotals();
      }
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

        // Load or compute trigram totals (backward compatible)
        if (jsonData.trigramTotals) {
          this.trigramTotals = new Map(jsonData.trigramTotals);
        } else {
          this.computeTrigramTotals();
        }
      }

      // Load or compute vocabulary (backward compatible)
      if (jsonData.vocabulary) {
        this.vocabulary = new Set(jsonData.vocabulary);
      } else {
        this.computeVocabulary();
      }

      this.loaded = true;
      return true;
    } catch (error) {
      log.error({ err: error }, 'Error loading model');
      return false;
    }
  }

  private computeBigramTotals(): void {
    for (const [key, transitions] of this.bigrams) {
      let total = 0;
      for (const count of transitions.values()) {
        total += count;
      }
      this.bigramTotals.set(key, total);
    }
  }

  private computeTrigramTotals(): void {
    for (const [key, transitions] of this.trigrams) {
      let total = 0;
      for (const count of transitions.values()) {
        total += count;
      }
      this.trigramTotals.set(key, total);
    }
  }

  private computeVocabulary(): void {
    // Backward compatibility: build vocabulary from bigram keys
    for (const key of this.bigrams.keys()) {
      this.vocabulary.add(key);
    }
    for (const transitions of this.bigrams.values()) {
      for (const word of transitions.keys()) {
        this.vocabulary.add(word);
      }
    }
  }
}
