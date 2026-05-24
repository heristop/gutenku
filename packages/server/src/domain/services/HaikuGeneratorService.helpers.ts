import type { VersePools } from './genetic/types';
import type {
  VerseEmbeddingService,
  EnhancedVersePools,
} from '../ml/VerseEmbeddingService';

/**
 * Ensure an embedding service is configured before any embedding-aware call.
 */
export function requireVerseEmbeddingService(
  service: VerseEmbeddingService | null,
): VerseEmbeddingService {
  if (!service) {
    throw new Error(
      'VerseEmbeddingService not set. Call setVerseEmbeddingService first.',
    );
  }

  return service;
}

export async function extractEnhancedVersePools(
  service: VerseEmbeddingService | null,
  versePools: VersePools,
): Promise<EnhancedVersePools> {
  return requireVerseEmbeddingService(service).embedVersePools(versePools);
}

export async function computeEmbeddingCoherence(
  service: VerseEmbeddingService | null,
  verses: [string, string, string],
): Promise<number> {
  return requireVerseEmbeddingService(service).computeSemanticCoherenceFromText(
    verses,
  );
}

export interface CompiledFilter {
  regex: RegExp | null;
  key: string | null;
}

/**
 * Compile a filter-words regex with a cache key. Returns `null` regex when
 * filter words are empty (matching everything). Returns `undefined` when the
 * caller already has the right regex compiled for this key.
 */
export function compileFilterWordsRegex(
  filterWords: string[],
  previousKey: string | null,
): CompiledFilter | undefined {
  const newKey =
    filterWords.length > 0 ? [...filterWords].sort().join('|') : null;

  if (previousKey === newKey) {
    return undefined;
  }

  if (filterWords.length === 0) {
    return { regex: null, key: newKey };
  }

  const escapedWords = filterWords.map((word) =>
    word.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );

  return { regex: new RegExp(escapedWords.join('|'), 'i'), key: newKey };
}
