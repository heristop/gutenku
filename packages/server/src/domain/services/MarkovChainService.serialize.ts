import type { createWriteStream } from 'node:fs';

/**
 * Pruning thresholds to reduce model size (entries below these counts are removed).
 */
export const MIN_BIGRAM_COUNT = 3;
export const MIN_TRIGRAM_COUNT = 5;

/**
 * Prune n-gram entries below a minimum count, returning the pruned map and
 * recomputed totals.
 */
export function pruneNgramMap(
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

type WriteStream = ReturnType<typeof createWriteStream>;

async function writeMapEntries<K, V>(
  stream: WriteStream,
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

async function writeSetEntries(
  stream: WriteStream,
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

/**
 * Stream a pruned Markov model to disk in batches to avoid loading the
 * entire JSON representation in memory at once.
 */
export async function writeModelToStream(
  stream: WriteStream,
  bigrams: Map<string, Map<string, number>>,
  trigrams: Map<string, Map<string, number>>,
  bigramTotals: Map<string, number>,
  trigramTotals: Map<string, number>,
  vocabulary: Set<string>,
  totalBigrams: number,
  totalTrigrams: number,
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
  await writeMapEntries(
    stream,
    bigrams,
    BATCH_SIZE,
    yieldToGC,
    waitForDrain,
    true,
  );

  stream.write('],"trigrams":[');
  await writeMapEntries(
    stream,
    trigrams,
    BATCH_SIZE,
    yieldToGC,
    waitForDrain,
    true,
  );

  stream.write('],"bigramTotals":[');
  await writeMapEntries(
    stream,
    bigramTotals,
    BATCH_SIZE,
    yieldToGC,
    waitForDrain,
    false,
  );

  stream.write('],"trigramTotals":[');
  await writeMapEntries(
    stream,
    trigramTotals,
    BATCH_SIZE,
    yieldToGC,
    waitForDrain,
    false,
  );

  stream.write('],"totalBigrams":');
  stream.write(String(totalBigrams));
  stream.write(',"totalTrigrams":');
  stream.write(String(totalTrigrams));

  stream.write(',"vocabulary":[');
  await writeSetEntries(stream, vocabulary, BATCH_SIZE, yieldToGC);
  stream.write(']}');

  await new Promise<void>((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', resolve);
    stream.end();
  });
}
