import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('markov');
import { inject, singleton } from 'tsyringe';
import {
  MIN_BIGRAM_COUNT,
  MIN_TRIGRAM_COUNT,
  pruneNgramMap,
  writeModelToStream,
} from '~/domain/services/MarkovChainService.serialize';
import {
  handleLoadError,
  loadBigramsFromJson,
  loadTrigramsFromJson,
  loadVocabularyFromJson,
  type MarkovModelJson,
} from '~/domain/services/MarkovChainService.loaders';

const FANBOYS_SET = new Set(['for', 'and', 'nor', 'but', 'or', 'yet', 'so']);

// Smoothing constant for Laplace smoothing
const SMOOTHING_ALPHA = 0.01;

// Maximum model file size to attempt loading (500MB)
const MAX_MODEL_SIZE_BYTES = 500 * 1024 * 1024;

@singleton()
export class MarkovChainService {
  private bigrams: Map<string, Map<string, number>>;
  private trigrams: Map<string, Map<string, number>>;
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

      for (const word of words) {
        const lowerWord = word.toLowerCase();

        if (!FANBOYS_SET.has(lowerWord)) {
          wordList.push(lowerWord);
          this.vocabulary.add(lowerWord);
        }
      }

      for (let i = 0; i < wordList.length - 1; i++) {
        const from = wordList[i];
        const to = wordList[i + 1];

        let transitions = this.bigrams.get(from);

        if (!transitions) {
          transitions = new Map();
          this.bigrams.set(from, transitions);
        }

        transitions.set(to, (transitions.get(to) || 0) + 1);
        this.bigramTotals.set(from, (this.bigramTotals.get(from) || 0) + 1);
        this.totalBigrams++;
      }

      for (let i = 0; i < wordList.length - 2; i++) {
        const key = `${wordList[i]} ${wordList[i + 1]}`;
        const next = wordList[i + 2];

        let transitions = this.trigrams.get(key);

        if (!transitions) {
          transitions = new Map();
          this.trigrams.set(key, transitions);
        }

        transitions.set(next, (transitions.get(next) || 0) + 1);
        this.trigramTotals.set(key, (this.trigramTotals.get(key) || 0) + 1);
        this.totalTrigrams++;
      }
    }
  }

  /**
   * Import pre-computed training data (e.g., from parallel training).
   */
  public importTrainingData(data: {
    bigrams: Map<string, Map<string, number>>;
    trigrams: Map<string, Map<string, number>>;
    bigramTotals: Map<string, number>;
    trigramTotals: Map<string, number>;
    totalBigrams: number;
    totalTrigrams: number;
    vocabulary: Set<string>;
  }): void {
    this.bigrams = data.bigrams;
    this.trigrams = data.trigrams;
    this.bigramTotals = data.bigramTotals;
    this.trigramTotals = data.trigramTotals;
    this.totalBigrams = data.totalBigrams;
    this.totalTrigrams = data.totalTrigrams;
    this.vocabulary = data.vocabulary;
  }

  public evaluateTransition(from: string, to: string): number {
    const fromWords = this.naturalLanguage.extractWords(from);
    const toWords = this.naturalLanguage.extractWords(to);

    if (fromWords.length === 0 || toWords.length === 0) {
      return 0;
    }

    const lastWordFrom = fromWords.at(-1)!.toLowerCase();
    const firstWordTo = toWords[0].toLowerCase();
    const transitions = this.bigrams.get(lastWordFrom);

    if (transitions) {
      const count = transitions.get(firstWordTo);

      if (count) {
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

    const len = fromWords.length;
    const key = `${fromWords[len - 2].toLowerCase()} ${fromWords[len - 1].toLowerCase()}`;
    const firstWordTo = toWords[0].toLowerCase();
    const transitions = this.trigrams.get(key);

    if (transitions) {
      const count = transitions.get(firstWordTo);

      if (count) {
        const totalTransitions = this.trigramTotals.get(key) || 0;

        return totalTransitions > 0 ? count / totalTransitions : 0;
      }
    }

    return 0;
  }

  /**
   * Evaluate bigram transition with Laplace smoothing.
   */
  public evaluateTransitionSmoothed(from: string, to: string): number {
    const fromWords = this.naturalLanguage.extractWords(from);
    const toWords = this.naturalLanguage.extractWords(to);

    if (fromWords.length === 0 || toWords.length === 0) {
      return SMOOTHING_ALPHA / (SMOOTHING_ALPHA * this.vocabulary.size || 1);
    }

    const lastWordFrom = fromWords.at(-1)!.toLowerCase();
    const firstWordTo = toWords[0].toLowerCase();

    const transitions = this.bigrams.get(lastWordFrom);
    const totalTransitions = this.bigramTotals.get(lastWordFrom) || 0;
    const vocabSize = this.vocabulary.size || 1;

    const count = transitions?.get(firstWordTo) || 0;

    return (
      (count + SMOOTHING_ALPHA) /
      (totalTransitions + SMOOTHING_ALPHA * vocabSize)
    );
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

    const len = fromWords.length;
    const key = `${fromWords[len - 2].toLowerCase()} ${fromWords[len - 1].toLowerCase()}`;
    const firstWordTo = toWords[0].toLowerCase();

    const transitions = this.trigrams.get(key);
    const totalTransitions = this.trigramTotals.get(key) || 0;
    const vocabSize = this.vocabulary.size || 1;

    const count = transitions?.get(firstWordTo) || 0;

    return (
      (count + SMOOTHING_ALPHA) /
      (totalTransitions + SMOOTHING_ALPHA * vocabSize)
    );
  }

  /**
   * Backoff strategy: tries bigrams first, falls back to trigrams on zero probability.
   */
  public evaluateWithBackoff(from: string, to: string): number {
    const bigramScore = this.evaluateTransition(from, to);

    if (bigramScore > 0) {
      return bigramScore;
    }

    return this.evaluateTrigramTransition(from, to);
  }

  public async saveModel(): Promise<boolean> {
    const stream = createWriteStream('./data/markov_model.json', {
      encoding: 'utf8',
    });

    try {
      const { pruned: prunedBigrams, totals: bigramTotals } = pruneNgramMap(
        this.bigrams,
        MIN_BIGRAM_COUNT,
      );
      const { pruned: prunedTrigrams, totals: trigramTotals } = pruneNgramMap(
        this.trigrams,
        MIN_TRIGRAM_COUNT,
      );

      const vocabulary = new Set<string>();
      
for (const key of prunedBigrams.keys()) {
        vocabulary.add(key);
      }
      
for (const t of prunedBigrams.values()) {
        for (const w of t.keys()) {
          vocabulary.add(w);
        }
      }

      log.info(
        {
          originalBigrams: this.bigrams.size,
          prunedBigrams: prunedBigrams.size,
          originalTrigrams: this.trigrams.size,
          prunedTrigrams: prunedTrigrams.size,
        },
        'Pruned low-frequency entries',
      );

      await writeModelToStream(
        stream,
        prunedBigrams,
        prunedTrigrams,
        bigramTotals,
        trigramTotals,
        vocabulary,
        this.totalBigrams,
        this.totalTrigrams,
      );

      return true;
    } catch (error) {
      log.error({ err: error }, 'Error saving model');
      stream.destroy();

      return false;
    }
  }

  public isModelLoaded(): boolean {
    return this.loaded && this.bigrams.size > 0;
  }

  public getStats(): {
    bigrams: number;
    trigrams: number;
    vocabulary: number;
    totalBigrams: number;
    totalTrigrams: number;
  } {
    return {
      bigrams: this.bigrams.size,
      trigrams: this.trigrams.size,
      vocabulary: this.vocabulary.size,
      totalBigrams: this.totalBigrams,
      totalTrigrams: this.totalTrigrams,
    };
  }

  public async loadModel(): Promise<boolean> {
    if (this.loaded && this.bigrams.size > 0) {
      return true;
    }

    try {
      const stats = await fs.stat('./data/markov_model.json');

      if (stats.size > MAX_MODEL_SIZE_BYTES) {
        log.warn(
          { size: stats.size, maxSize: MAX_MODEL_SIZE_BYTES },
          'Markov model file too large, skipping load to prevent OOM',
        );

        return false;
      }

      const data = await fs.readFile('./data/markov_model.json', 'utf8');
      const jsonData = JSON.parse(data) as MarkovModelJson;

      this.applyLoadedJson(jsonData);

      this.loaded = true;
      log.info(
        { bigrams: this.bigrams.size, trigrams: this.trigrams.size },
        'Markov model loaded',
      );

      return true;
    } catch (error) {
      handleLoadError(error);

      return false;
    }
  }

  private applyLoadedJson(jsonData: MarkovModelJson): void {
    const bigramData = loadBigramsFromJson(jsonData);
    this.bigrams = bigramData.bigrams;
    this.bigramTotals = bigramData.bigramTotals;
    this.totalBigrams = bigramData.totalBigrams;

    const trigramData = loadTrigramsFromJson(jsonData);
    this.trigrams = trigramData.trigrams;
    this.trigramTotals = trigramData.trigramTotals;
    this.totalTrigrams = trigramData.totalTrigrams;

    this.vocabulary = loadVocabularyFromJson(jsonData);
  }
}
