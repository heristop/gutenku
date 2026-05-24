import {
  DEFAULT_SENTIMENT_MIN_SCORE,
  DEFAULT_MARKOV_MIN_SCORE,
  DEFAULT_GRAMMAR_MIN_SCORE,
  DEFAULT_TRIGRAM_MIN_SCORE,
  DEFAULT_ALLITERATION_MIN_SCORE,
  DEFAULT_UNIQUENESS_MIN_SCORE,
  DEFAULT_VERSE_DISTANCE_MIN_SCORE,
  DEFAULT_LINE_BALANCE_MIN_SCORE,
  DEFAULT_IMAGERY_MIN_SCORE,
  DEFAULT_COHERENCE_MIN_SCORE,
  DEFAULT_VERB_MIN_SCORE,
} from '~/shared/constants/validation';
import type {
  GeneratorConfig,
  ScoreConfig,
  ScoreThresholds,
} from './HaikuGeneratorTypes';

export const DEFAULT_GENERATOR_CONFIG: GeneratorConfig = {
  cache: { minCachedDocs: 100, ttl: 0, enabled: false },
  score: {
    sentiment: null,
    markovChain: null,
    pos: null,
    trigram: null,
    tfidf: null,
    phonetics: null,
    uniqueness: null,
    verseDistance: null,
    lineLengthBalance: null,
    imageryDensity: null,
    semanticCoherence: null,
    verbPresence: null,
  },
  theme: 'random',
};

function resolvePrimaryScores(
  score: ScoreConfig,
): Pick<
  ScoreThresholds,
  'sentiment' | 'markov' | 'pos' | 'trigram' | 'tfidf' | 'phonetics'
> {
  return {
    sentiment: score.sentiment ?? DEFAULT_SENTIMENT_MIN_SCORE,
    markov: score.markovChain ?? DEFAULT_MARKOV_MIN_SCORE,
    pos: score.pos ?? DEFAULT_GRAMMAR_MIN_SCORE,
    trigram: score.trigram ?? DEFAULT_TRIGRAM_MIN_SCORE,
    tfidf: score.tfidf ?? 0,
    phonetics: score.phonetics ?? DEFAULT_ALLITERATION_MIN_SCORE,
  };
}

function resolveSecondaryScores(
  score: ScoreConfig,
): Pick<
  ScoreThresholds,
  | 'uniqueness'
  | 'verseDistance'
  | 'lineLengthBalance'
  | 'imageryDensity'
  | 'semanticCoherence'
  | 'verbPresence'
> {
  return {
    uniqueness: score.uniqueness ?? DEFAULT_UNIQUENESS_MIN_SCORE,
    verseDistance: score.verseDistance ?? DEFAULT_VERSE_DISTANCE_MIN_SCORE,
    lineLengthBalance:
      score.lineLengthBalance ?? DEFAULT_LINE_BALANCE_MIN_SCORE,
    imageryDensity: score.imageryDensity ?? DEFAULT_IMAGERY_MIN_SCORE,
    semanticCoherence: score.semanticCoherence ?? DEFAULT_COHERENCE_MIN_SCORE,
    verbPresence: score.verbPresence ?? DEFAULT_VERB_MIN_SCORE,
  };
}

export function buildThresholds(score: ScoreConfig): ScoreThresholds {
  return {
    ...resolvePrimaryScores(score),
    ...resolveSecondaryScores(score),
    maxRepeatedWords: 0,
    allowWeakStart: true,
  };
}
