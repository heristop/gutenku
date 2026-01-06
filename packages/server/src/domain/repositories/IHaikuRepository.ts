import type { HaikuValue } from '../../shared/types';

export interface IHaikuRepository {
  createCacheWithTTL(haiku: HaikuValue, ttl: number): Promise<void>;
  extractFromCache(size: number, minCachedDocs: number): Promise<HaikuValue[]>;
  extractOneFromCache(minCachedDocs: number): Promise<HaikuValue | null>;
  extractDeterministicFromCache(
    seed: number,
    minCachedDocs: number,
  ): Promise<HaikuValue | null>;
}

export const IHaikuRepositoryToken = 'IHaikuRepository';
