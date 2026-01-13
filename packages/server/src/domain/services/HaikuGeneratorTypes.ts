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
  uniqueness: number | null;
  verseDistance: number | null;
  lineLengthBalance: number | null;
  imageryDensity: number | null;
  semanticCoherence: number | null;
  verbPresence: number | null;
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
  uniqueness: number;
  verseDistance: number;
  lineLengthBalance: number;
  imageryDensity: number;
  semanticCoherence: number;
  verbPresence: number;
  maxRepeatedWords: number;
  allowWeakStart: boolean;
}

export interface RejectionStats {
  sentiment: number;
  markov: number;
  grammar: number;
  trigram: number;
  tfidf: number;
  phonetics: number;
  uniqueness: number;
  verseDistance: number;
  lineLengthBalance: number;
  imageryDensity: number;
  semanticCoherence: number;
  verbPresence: number;
  basic: number;
  total: number;
}

export interface QuoteCandidate {
  quote: string;
  index: number;
  syllableCount: number;
}
