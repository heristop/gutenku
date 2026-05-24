import { createLogger } from '~/infrastructure/services/Logger';
import type { HaikuValue } from '~/shared/types';
import type { DecodedHaiku } from '~/domain/services/genetic';

const log = createLogger('openai');

/**
 * Convert a GA candidate into a serializable HaikuValue, copying the
 * book/chapter metadata from the original seed haiku.
 */
export function convertGAResultToHaikuValue(
  gaResult: DecodedHaiku,
  seedHaiku: HaikuValue,
): HaikuValue {
  return {
    book: {
      reference: seedHaiku.book.reference,
      title: seedHaiku.book.title,
      author: seedHaiku.book.author,
      emoticons: seedHaiku.book.emoticons,
    },
    cacheUsed: false,
    chapter: seedHaiku.chapter,
    context: [], // Empty context for GA-generated haikus
    executionTime: 0,
    rawVerses: [...gaResult.verses],
    verses: [...gaResult.verses],
    quality: {
      totalScore: gaResult.fitness,
      natureWords: gaResult.metrics.natureWords,
      repeatedWords: gaResult.metrics.repeatedWords,
      weakStarts: gaResult.metrics.weakStarts,
      blacklistedVerses: gaResult.metrics.blacklistedVerses ?? 0,
      properNouns: gaResult.metrics.properNouns ?? 0,
      verseLengthPenalty: gaResult.metrics.verseLengthPenalty ?? 0,
      sentiment: gaResult.metrics.sentiment,
      grammar: gaResult.metrics.grammar,
      markovFlow: gaResult.metrics.markovFlow,
      trigramFlow: gaResult.metrics.trigramFlow,
      uniqueness: gaResult.metrics.uniqueness,
      alliteration: gaResult.metrics.alliteration,
      verseDistance: gaResult.metrics.verseDistance,
      lineLengthBalance: gaResult.metrics.lineLengthBalance,
      imageryDensity: gaResult.metrics.imageryDensity,
      semanticCoherence: gaResult.metrics.semanticCoherence,
      verbPresence: gaResult.metrics.verbPresence,
    },
    extractionMethod: 'genetic_algorithm',
  };
}

/**
 * Format a haiku candidate (verses + quality metrics) as a prompt entry for
 * the chat model.
 */
export function formatHaikuCandidate(haiku: HaikuValue, index: number): string {
  const q = haiku.quality;
  const qualityDetails = formatQualityDetails(q);

  log.debug(
    { id: index, verses: haiku.verses, quality: q },
    'Haiku candidate with quality score',
  );

  return `[Id]: ${index}\n[Verses]: ${haiku.verses.join(' / ')}\n[Quality]: ${qualityDetails}\n`;
}

export function formatQualityDetails(q?: HaikuValue['quality']): string {
  if (!q) {
    return 'nature_words=0, repeated_words=0, weak_starts=0, sentiment=0.50, grammar=0.00, markov_flow=0.00, trigram_flow=0.00, uniqueness=0.00, alliteration=0.00, verse_distance=0.00, line_balance=0.00, imagery=0.00, coherence=0.00, verb_presence=0.00, total_score=0.00';
  }
  const parts = [
    `nature_words=${q.natureWords}`,
    `repeated_words=${q.repeatedWords}`,
    `weak_starts=${q.weakStarts}`,
    `sentiment=${q.sentiment.toFixed(2)}`,
    `grammar=${q.grammar.toFixed(2)}`,
    `markov_flow=${q.markovFlow.toFixed(2)}`,
    `trigram_flow=${q.trigramFlow.toFixed(2)}`,
    `uniqueness=${q.uniqueness.toFixed(2)}`,
    `alliteration=${q.alliteration.toFixed(2)}`,
    `verse_distance=${q.verseDistance.toFixed(2)}`,
    `line_balance=${q.lineLengthBalance.toFixed(2)}`,
    `imagery=${q.imageryDensity.toFixed(2)}`,
    `coherence=${q.semanticCoherence.toFixed(2)}`,
    `verb_presence=${q.verbPresence.toFixed(2)}`,
    `total_score=${q.totalScore.toFixed(2)}`,
  ];

  return parts.join(', ');
}
