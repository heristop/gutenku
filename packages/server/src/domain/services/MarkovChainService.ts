import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('markov');
import { inject, singleton } from 'tsyringe';

const FANBOYS_SET = new Set(['for', 'and', 'nor', 'but', 'or', 'yet', 'so']);

// Smoothing constant for Laplace smoothing
const SMOOTHING_ALPHA = 0.01;

// Maximum model file size to attempt loading (500MB)
const MAX_MODEL_SIZE_BYTES = 500 * 1024 * 1024;

@singleton()
export class MarkovChainService {
  private bigrams: Map<string, Map<string, number>>;
  private trigrams: Map<string, Map<string, number>>;
  // Cached transition totals for performance
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

    const lastWordFrom = fromWords.at(-1).toLowerCase();
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

    const lastWordFrom = fromWords.at(-1).toLowerCase();
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
      await this.writeModelToStream(stream);
      return true;
    } catch (error) {
      log.error({ err: error }, 'Error saving model');
      stream.destroy();
      return false;
    }
  }

  private async writeModelToStream(
    stream: ReturnType<typeof createWriteStream>,
  ): Promise<void> {
    const BATCH_SIZE = 10000;

    const yieldToGC = (): Promise<void> =>
      new Promise((resolve) => {
        setImmediate(resolve);
      });

    const waitForDrain = (): Promise<void> =>
      new Promise((resolve) => {
        stream.once('drain', resolve);
      });

    // Write bigrams
    stream.write('{"bigrams":[');
    await this.writeMapEntries(
      stream,
      this.bigrams,
      BATCH_SIZE,
      yieldToGC,
      waitForDrain,
      true,
    );

    // Write trigrams
    stream.write('],"trigrams":[');
    await this.writeMapEntries(
      stream,
      this.trigrams,
      BATCH_SIZE,
      yieldToGC,
      waitForDrain,
      true,
    );

    // Write totals
    stream.write('],"bigramTotals":[');
    await this.writeMapEntries(
      stream,
      this.bigramTotals,
      BATCH_SIZE,
      yieldToGC,
      waitForDrain,
      false,
    );

    stream.write('],"trigramTotals":[');
    await this.writeMapEntries(
      stream,
      this.trigramTotals,
      BATCH_SIZE,
      yieldToGC,
      waitForDrain,
      false,
    );

    stream.write('],"totalBigrams":');
    stream.write(String(this.totalBigrams));
    stream.write(',"totalTrigrams":');
    stream.write(String(this.totalTrigrams));

    // Write vocabulary
    stream.write(',"vocabulary":[');
    await this.writeSetEntries(stream, this.vocabulary, BATCH_SIZE, yieldToGC);
    stream.write(']}');

    // Wait for stream to finish
    await new Promise<void>((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', resolve);
      stream.end();
    });
  }

  private async writeMapEntries<K, V>(
    stream: ReturnType<typeof createWriteStream>,
    map: Map<K, V>,
    batchSize: number,
    yieldToGC: () => Promise<void>,
    waitForDrain: () => Promise<void>,
    spreadValue: boolean,
  ): Promise<void> {
    const STRINGIFY_BATCH = 500;
    let first = true;
    let count = 0;
    let batch: unknown[] = [];

    for (const [key, value] of map) {
      const data = spreadValue
        ? [key, [...(value as Map<string, number>)]]
        : [key, value];
      batch.push(data);

      if (batch.length >= STRINGIFY_BATCH) {
        const prefix = first ? '' : ',';
        first = false;
        const ok = stream.write(
          prefix + batch.map((b) => JSON.stringify(b)).join(','),
        );
        batch = [];

        if (!ok) {
          await waitForDrain();
        }
      }

      if (++count % batchSize === 0) {
        await yieldToGC();
      }
    }

    if (batch.length > 0) {
      const prefix = first ? '' : ',';
      stream.write(prefix + batch.map((b) => JSON.stringify(b)).join(','));
    }
  }

  private async writeSetEntries(
    stream: ReturnType<typeof createWriteStream>,
    set: Set<string>,
    batchSize: number,
    yieldToGC: () => Promise<void>,
  ): Promise<void> {
    const STRINGIFY_BATCH = 500;
    let first = true;
    let count = 0;
    let batch: string[] = [];

    for (const item of set) {
      batch.push(item);

      if (batch.length >= STRINGIFY_BATCH) {
        const prefix = first ? '' : ',';
        first = false;
        stream.write(prefix + batch.map((b) => JSON.stringify(b)).join(','));
        batch = [];
      }

      if (++count % batchSize === 0) {
        await yieldToGC();
      }
    }

    if (batch.length > 0) {
      const prefix = first ? '' : ',';
      stream.write(prefix + batch.map((b) => JSON.stringify(b)).join(','));
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
      }

      if (!jsonData.bigramTotals) {
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
        }

        if (!jsonData.trigramTotals) {
          this.computeTrigramTotals();
        }
      }

      // Load or compute vocabulary (backward compatible)
      if (jsonData.vocabulary) {
        this.vocabulary = new Set(jsonData.vocabulary);
      }

      if (!jsonData.vocabulary) {
        this.computeVocabulary();
      }

      this.loaded = true;
      log.info(
        { bigrams: this.bigrams.size, trigrams: this.trigrams.size },
        'Markov model loaded',
      );
      return true;
    } catch (error) {
      log.warn(
        { err: error },
        'Markov model not loaded - markov validation will be disabled',
      );
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
