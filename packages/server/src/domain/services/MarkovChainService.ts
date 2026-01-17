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

// Pruning thresholds to reduce model size (entries below these counts are removed)
const MIN_BIGRAM_COUNT = 3;
const MIN_TRIGRAM_COUNT = 5;

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
      const { pruned: prunedBigrams, totals: bigramTotals } =
        this.pruneNgramMap(this.bigrams, MIN_BIGRAM_COUNT);
      const { pruned: prunedTrigrams, totals: trigramTotals } =
        this.pruneNgramMap(this.trigrams, MIN_TRIGRAM_COUNT);

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

      await this.writeModelToStream(
        stream,
        prunedBigrams,
        prunedTrigrams,
        bigramTotals,
        trigramTotals,
        vocabulary,
      );
      return true;
    } catch (error) {
      log.error({ err: error }, 'Error saving model');
      stream.destroy();
      return false;
    }
  }

  private pruneNgramMap(
    source: Map<string, Map<string, number>>,
    minCount: number,
  ): { pruned: Map<string, Map<string, number>>; totals: Map<string, number> } {
    const pruned = new Map<string, Map<string, number>>();
    const totals = new Map<string, number>();

    for (const [key, transitions] of source) {
      const prunedTransitions = new Map<string, number>();
      let total = 0;

      for (const [word, count] of transitions) {
        if (count >= minCount) {
          prunedTransitions.set(word, count);
          total += count;
        }
      }

      if (prunedTransitions.size > 0) {
        pruned.set(key, prunedTransitions);
        totals.set(key, total);
      }
    }

    return { pruned, totals };
  }

  private async writeModelToStream(
    stream: ReturnType<typeof createWriteStream>,
    bigrams: Map<string, Map<string, number>>,
    trigrams: Map<string, Map<string, number>>,
    bigramTotals: Map<string, number>,
    trigramTotals: Map<string, number>,
    vocabulary: Set<string>,
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

    stream.write('{"bigrams":[');
    await this.writeMapEntries(
      stream,
      bigrams,
      BATCH_SIZE,
      yieldToGC,
      waitForDrain,
      true,
    );

    stream.write('],"trigrams":[');
    await this.writeMapEntries(
      stream,
      trigrams,
      BATCH_SIZE,
      yieldToGC,
      waitForDrain,
      true,
    );

    stream.write('],"bigramTotals":[');
    await this.writeMapEntries(
      stream,
      bigramTotals,
      BATCH_SIZE,
      yieldToGC,
      waitForDrain,
      false,
    );

    stream.write('],"trigramTotals":[');
    await this.writeMapEntries(
      stream,
      trigramTotals,
      BATCH_SIZE,
      yieldToGC,
      waitForDrain,
      false,
    );

    stream.write('],"totalBigrams":');
    stream.write(String(this.totalBigrams));
    stream.write(',"totalTrigrams":');
    stream.write(String(this.totalTrigrams));

    stream.write(',"vocabulary":[');
    await this.writeSetEntries(stream, vocabulary, BATCH_SIZE, yieldToGC);
    stream.write(']}');

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

      this.loadBigramsFromJson(jsonData);
      this.loadTrigramsFromJson(jsonData);
      this.loadVocabularyFromJson(jsonData);

      this.loaded = true;
      log.info(
        { bigrams: this.bigrams.size, trigrams: this.trigrams.size },
        'Markov model loaded',
      );
      return true;
    } catch (error) {
      this.handleLoadError(error);
      return false;
    }
  }

  private loadBigramsFromJson(jsonData: {
    bigrams: [string, [string, number][]][];
    totalBigrams: number;
    bigramTotals?: [string, number][];
  }): void {
    this.bigrams = new Map(
      jsonData.bigrams.map(([key, value]) => [key, new Map(value)]),
    );
    this.totalBigrams = jsonData.totalBigrams;

    if (jsonData.bigramTotals) {
      this.bigramTotals = new Map(jsonData.bigramTotals);
    } else {
      this.computeBigramTotals();
    }
  }

  private loadTrigramsFromJson(jsonData: {
    trigrams?: [string, [string, number][]][];
    totalTrigrams?: number;
    trigramTotals?: [string, number][];
  }): void {
    if (!jsonData.trigrams) {
      return;
    }

    this.trigrams = new Map(
      jsonData.trigrams.map(([key, value]) => [key, new Map(value)]),
    );
    this.totalTrigrams = jsonData.totalTrigrams || 0;

    if (jsonData.trigramTotals) {
      this.trigramTotals = new Map(jsonData.trigramTotals);
    } else {
      this.computeTrigramTotals();
    }
  }

  private loadVocabularyFromJson(jsonData: { vocabulary?: string[] }): void {
    if (jsonData.vocabulary) {
      this.vocabulary = new Set(jsonData.vocabulary);
    } else {
      this.computeVocabulary();
    }
  }

  private handleLoadError(error: unknown): void {
    const isFileNotFound =
      error instanceof Error && 'code' in error && error.code === 'ENOENT';

    if (isFileNotFound) {
      log.info(
        'Markov model not found at ./data/markov_model.json - run "pnpm mc:train" to generate it',
      );
    } else {
      log.error({ err: error }, 'Failed to load Markov model');
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
