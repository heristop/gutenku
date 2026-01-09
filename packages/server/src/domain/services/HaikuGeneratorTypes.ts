export interface CacheConfig {
  minCachedDocs: number;
  ttl: number;
  enabled: boolean;
}

export interface ScoreConfig {
  sentiment: number | null;
  markovChain: number | null;
  pos: number | null;
  trigram: number | null;
  tfidf: number | null;
  phonetics: number | null;
}

export interface GeneratorConfig {
  cache: CacheConfig;
  score: ScoreConfig;
  theme: string;
}

export interface ScoreThresholds {
  sentiment: number;
  markov: number;
  pos: number;
  trigram: number;
  tfidf: number;
  phonetics: number;
  maxRepeatedWords: number;
  allowWeakStart: boolean;
}

export interface QuoteCandidate {
  quote: string;
  index: number;
  syllableCount: number;
}
