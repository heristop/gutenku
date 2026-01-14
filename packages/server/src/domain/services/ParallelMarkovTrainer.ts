import { Worker } from 'node:worker_threads';
import { cpus } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('parallel-markov');

interface WorkerResult {
  bigrams: [string, [string, number][]][];
  trigrams: [string, [string, number][]][];
  bigramTotals: [string, number][];
  trigramTotals: [string, number][];
  totalBigrams: number;
  totalTrigrams: number;
  vocabulary: string[];
}

interface MergedResult {
  bigrams: Map<string, Map<string, number>>;
  trigrams: Map<string, Map<string, number>>;
  bigramTotals: Map<string, number>;
  trigramTotals: Map<string, number>;
  totalBigrams: number;
  totalTrigrams: number;
  vocabulary: Set<string>;
}

export class ParallelMarkovTrainer {
  private workerPath: string;
  private workerCount: number;

  constructor(workerCount?: number) {
    this.workerCount = workerCount ?? Math.max(1, cpus().length - 1);

    const currentDir = dirname(fileURLToPath(import.meta.url));
    this.workerPath = join(currentDir, '../../../scripts/markov-worker.ts');
  }

  async train(
    chapters: string[],
    onProgress?: (completed: number, total: number) => void,
  ): Promise<MergedResult> {
    const batches = this.splitIntoBatches(chapters);
    const results = await this.runWorkers(batches, onProgress);
    return this.mergeResults(results);
  }

  private splitIntoBatches(chapters: string[]): string[][] {
    const batchCount = Math.min(this.workerCount, chapters.length);
    const batches: string[][] = Array.from({ length: batchCount }, () => []);

    for (let i = 0; i < chapters.length; i++) {
      batches[i % batchCount].push(chapters[i]);
    }

    return batches.filter((b) => b.length > 0);
  }

  private async runWorkers(
    batches: string[][],
    onProgress?: (completed: number, total: number) => void,
  ): Promise<WorkerResult[]> {
    let completed = 0;
    const total = batches.length;

    const workerPromises = batches.map(
      (batch, index) =>
        new Promise<WorkerResult>((resolve, reject) => {
          const worker = new Worker(this.workerPath, {
            workerData: { chapters: batch },
            execArgv: ['--import', 'tsx'],
          });

          worker.on('message', (result: WorkerResult) => {
            completed++;

            if (onProgress) {
              onProgress(completed, total);
            }

            resolve(result);
          });

          worker.on('error', (err) => {
            log.error({ worker: index, err }, 'Worker error');
            reject(err);
          });

          worker.on('exit', (code) => {
            if (code !== 0) {
              reject(new Error(`Worker exited with code ${code}`));
            }
          });
        }),
    );

    return Promise.all(workerPromises);
  }

  private mergeResults(results: WorkerResult[]): MergedResult {
    const bigrams = new Map<string, Map<string, number>>();
    const trigrams = new Map<string, Map<string, number>>();
    const bigramTotals = new Map<string, number>();
    const trigramTotals = new Map<string, number>();
    const vocabulary = new Set<string>();
    let totalBigrams = 0;
    let totalTrigrams = 0;

    for (const result of results) {
      // Merge bigrams
      for (const [key, transitions] of result.bigrams) {
        let existing = bigrams.get(key);

        if (!existing) {
          existing = new Map();
          bigrams.set(key, existing);
        }

        for (const [word, count] of transitions) {
          existing.set(word, (existing.get(word) || 0) + count);
        }
      }

      // Merge trigrams
      for (const [key, transitions] of result.trigrams) {
        let existing = trigrams.get(key);

        if (!existing) {
          existing = new Map();
          trigrams.set(key, existing);
        }

        for (const [word, count] of transitions) {
          existing.set(word, (existing.get(word) || 0) + count);
        }
      }

      // Merge totals
      for (const [key, count] of result.bigramTotals) {
        bigramTotals.set(key, (bigramTotals.get(key) || 0) + count);
      }

      for (const [key, count] of result.trigramTotals) {
        trigramTotals.set(key, (trigramTotals.get(key) || 0) + count);
      }

      // Merge vocabulary
      for (const word of result.vocabulary) {
        vocabulary.add(word);
      }

      totalBigrams += result.totalBigrams;
      totalTrigrams += result.totalTrigrams;
    }

    return {
      bigrams,
      trigrams,
      bigramTotals,
      trigramTotals,
      totalBigrams,
      totalTrigrams,
      vocabulary,
    };
  }
}
