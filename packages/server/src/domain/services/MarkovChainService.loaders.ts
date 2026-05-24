import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('markov');

export interface MarkovModelJson {
  bigrams: [string, [string, number][]][];
  trigrams: [string, [string, number][]][];
  bigramTotals: [string, number][];
  trigramTotals: [string, number][];
  totalBigrams: number;
  totalTrigrams: number;
  vocabulary: string[];
}

export interface LoadedBigrams {
  bigrams: Map<string, Map<string, number>>;
  bigramTotals: Map<string, number>;
  totalBigrams: number;
}

export interface LoadedTrigrams {
  trigrams: Map<string, Map<string, number>>;
  trigramTotals: Map<string, number>;
  totalTrigrams: number;
}

export function loadBigramsFromJson(jsonData: MarkovModelJson): LoadedBigrams {
  return {
    bigrams: new Map(
      jsonData.bigrams.map(([key, value]) => [key, new Map(value)]),
    ),
    totalBigrams: jsonData.totalBigrams,
    bigramTotals: new Map(jsonData.bigramTotals),
  };
}

export function loadTrigramsFromJson(
  jsonData: MarkovModelJson,
): LoadedTrigrams {
  return {
    trigrams: new Map(
      jsonData.trigrams.map(([key, value]) => [key, new Map(value)]),
    ),
    totalTrigrams: jsonData.totalTrigrams,
    trigramTotals: new Map(jsonData.trigramTotals),
  };
}

export function loadVocabularyFromJson(
  jsonData: MarkovModelJson,
): Set<string> {
  return new Set(jsonData.vocabulary);
}

export function handleLoadError(error: unknown): void {
  const isFileNotFound =
    error instanceof Error && 'code' in error && error.code === 'ENOENT';

  if (!isFileNotFound) {
    log.error({ err: error }, 'Failed to load Markov model');

    return;
  }

  log.info(
    'Markov model not found at ./data/markov_model.json - run "pnpm mc:train" to generate it',
  );
}
