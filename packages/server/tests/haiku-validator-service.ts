import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { HaikuValidatorService } from '../src/domain/services/HaikuValidatorService';
import type NaturalLanguageService from '../src/domain/services/NaturalLanguageService';
import type { MarkovEvaluatorService } from '../src/domain/services/MarkovEvaluatorService';
import type {
  ScoreThresholds,
  QuoteCandidate,
} from '../src/domain/services/HaikuGeneratorTypes';

const baseThresholds = (
  over: Partial<ScoreThresholds> = {},
): ScoreThresholds => ({
  sentiment: 0,
  markov: 0,
  pos: 0,
  trigram: 0,
  tfidf: 0,
  phonetics: 0,
  uniqueness: 0,
  verseDistance: 0,
  lineLengthBalance: 0,
  imageryDensity: 0,
  semanticCoherence: 0,
  verbPresence: 0,
  maxRepeatedWords: 0,
  allowWeakStart: true,
  ...over,
});

const makeNL = (over: Record<string, unknown> = {}): NaturalLanguageService =>
  ({
    startWithConjunction: () => false,
    hasUpperCaseWords: () => false,
    hasBlacklistedCharsInQuote: () => false,
    analyzeSentiment: () => 1,
    analyzeGrammar: () => ({ score: 1 }),
    scoreDistinctiveness: () => 1,
    analyzePhonetics: () => ({ alliterationScore: 1 }),
    getPOSTags: () => [{ word: 'x', tag: 'VB' }],
    ...over,
  }) as unknown as NaturalLanguageService;

const makeMarkov = (
  over: Record<string, unknown> = {},
): MarkovEvaluatorService =>
  ({
    evaluateHaiku: () => 1,
    evaluateHaikuTrigrams: () => 1,
    ...over,
  }) as unknown as MarkovEvaluatorService;

const candidate = (quote: string, index: number): QuoteCandidate => ({
  quote,
  index,
  syllableCount: 5,
});

describe('HaikuValidatorService.passesBasicValidation', () => {
  it('rejects first verse starting with a conjunction and tracks stats', () => {
    const v = new HaikuValidatorService(
      makeNL({ startWithConjunction: () => true }),
      makeMarkov(),
    );
    expect(
      v.passesBasicValidation('and the wind', true, baseThresholds()),
    ).toBeFalsy();
    expect(v.getRejectionStats().basic).toBe(1);
    expect(v.getRejectionStats().total).toBe(1);
  });

  it('rejects invalid quotes (uppercase words)', () => {
    const v = new HaikuValidatorService(
      makeNL({ hasUpperCaseWords: () => true }),
      makeMarkov(),
    );
    expect(
      v.passesBasicValidation('LOUD', false, baseThresholds()),
    ).toBeFalsy();
  });

  it('rejects weak starts when not allowed', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    // "it" matches the weak-start pattern
    const result = v.passesBasicValidation(
      'it is quiet',
      false,
      baseThresholds({ allowWeakStart: false }),
    );
    expect(result).toBeFalsy();
    expect(v.getRejectionStats().basic).toBe(1);
  });

  it('allows weak starts when permitted', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    const result = v.passesBasicValidation(
      'it is quiet',
      false,
      baseThresholds({ allowWeakStart: true }),
    );
    expect(result).toBeTruthy();
  });

  it('accepts a clean quote', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    expect(
      v.passesBasicValidation('quiet river', false, baseThresholds()),
    ).toBeTruthy();
  });
});

describe('HaikuValidatorService.passesScoreValidation', () => {
  it('rejects when sentiment below threshold', () => {
    const v = new HaikuValidatorService(
      makeNL({ analyzeSentiment: () => 0.1 }),
      makeMarkov(),
    );
    expect(
      v.passesScoreValidation('q', baseThresholds({ sentiment: 0.5 })),
    ).toBeFalsy();
    expect(v.getRejectionStats().sentiment).toBe(1);
  });

  it('caches sentiment scores across calls', () => {
    const analyzeSentiment = vi.fn(() => 1);
    const v = new HaikuValidatorService(
      makeNL({ analyzeSentiment }),
      makeMarkov(),
    );
    v.passesScoreValidation('same', baseThresholds());
    v.passesScoreValidation('same', baseThresholds());
    expect(analyzeSentiment).toHaveBeenCalledTimes(1);
    v.clearCache();
    v.passesScoreValidation('same', baseThresholds());
    expect(analyzeSentiment).toHaveBeenCalledTimes(2);
  });

  it('rejects when grammar below threshold', () => {
    const v = new HaikuValidatorService(
      makeNL({ analyzeGrammar: () => ({ score: 0.1 }) }),
      makeMarkov(),
    );
    expect(
      v.passesScoreValidation('q', baseThresholds({ pos: 0.5 })),
    ).toBeFalsy();
    expect(v.getRejectionStats().grammar).toBe(1);
  });

  it('rejects when tfidf distinctiveness below threshold', () => {
    const v = new HaikuValidatorService(
      makeNL({ scoreDistinctiveness: () => 0.1 }),
      makeMarkov(),
    );
    expect(
      v.passesScoreValidation('q', baseThresholds({ tfidf: 0.5 })),
    ).toBeFalsy();
    expect(v.getRejectionStats().tfidf).toBe(1);
  });
});

describe('HaikuValidatorService.passesSequenceValidation', () => {
  const selected = [candidate('first', 0)];

  it('rejects when index is not strictly increasing', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    expect(
      v.passesSequenceValidation('q', 0, selected, baseThresholds()),
    ).toBeFalsy();
  });

  it('rejects when repeated words exceed max', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    const result = v.passesSequenceValidation(
      'first first first',
      1,
      [candidate('first first first', 0)],
      baseThresholds({ maxRepeatedWords: 1 }),
    );
    expect(result).toBeFalsy();
  });

  it('rejects when markov score below threshold', () => {
    const v = new HaikuValidatorService(
      makeNL(),
      makeMarkov({ evaluateHaiku: () => 0.1 }),
    );
    expect(
      v.passesSequenceValidation(
        'q',
        1,
        selected,
        baseThresholds({ markov: 0.5 }),
      ),
    ).toBeFalsy();
    expect(v.getRejectionStats().markov).toBe(1);
  });

  it('rejects when trigram score below threshold', () => {
    const v = new HaikuValidatorService(
      makeNL(),
      makeMarkov({ evaluateHaikuTrigrams: () => 0.1 }),
    );
    expect(
      v.passesSequenceValidation(
        'q',
        1,
        selected,
        baseThresholds({ trigram: 0.5 }),
      ),
    ).toBeFalsy();
    expect(v.getRejectionStats().trigram).toBe(1);
  });

  it('rejects when phonetics below threshold', () => {
    const v = new HaikuValidatorService(
      makeNL({ analyzePhonetics: () => ({ alliterationScore: 0.1 }) }),
      makeMarkov(),
    );
    expect(
      v.passesSequenceValidation(
        'q',
        1,
        selected,
        baseThresholds({ phonetics: 0.5 }),
      ),
    ).toBeFalsy();
    expect(v.getRejectionStats().phonetics).toBe(1);
  });

  it('rejects when uniqueness below threshold on third verse', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    const two = [candidate('the the the', 0), candidate('the the the', 1)];
    const result = v.passesSequenceValidation(
      'the the the',
      2,
      two,
      baseThresholds({ uniqueness: 0.99 }),
    );
    expect(result).toBeFalsy();
  });

  it('accepts a valid sequential quote', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    expect(
      v.passesSequenceValidation('quiet river', 1, selected, baseThresholds()),
    ).toBeTruthy();
  });
});

describe('HaikuValidatorService.passesFullHaikuFilters', () => {
  it('rejects on low verse distance', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    const result = v.passesFullHaikuFilters(
      ['a', 'b', 'c'],
      [0, 1, 2],
      100,
      baseThresholds({ verseDistance: 0.99 }),
    );
    expect(result).toBeFalsy();
    expect(v.getRejectionStats().verseDistance).toBe(1);
  });

  it('rejects on low line length balance', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    const result = v.passesFullHaikuFilters(
      ['short', 'a much much longer verse line here', 'x'],
      [0, 1, 2],
      3,
      baseThresholds({ lineLengthBalance: 0.99 }),
    );
    expect(result).toBeFalsy();
  });

  it('rejects on low imagery density', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    const result = v.passesFullHaikuFilters(
      ['plain talk here', 'just some words here', 'no nature found'],
      [0, 1, 2],
      3,
      baseThresholds({ imageryDensity: 0.99 }),
    );
    expect(result).toBeFalsy();
    expect(v.getRejectionStats().imageryDensity).toBe(1);
  });

  it('rejects on low semantic coherence', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    const result = v.passesFullHaikuFilters(
      ['alpha beta gamma', 'delta epsilon zeta', 'eta theta iota'],
      [0, 1, 2],
      3,
      baseThresholds({ semanticCoherence: 0.99 }),
    );
    expect(result).toBeFalsy();
    expect(v.getRejectionStats().semanticCoherence).toBe(1);
  });

  it('rejects on low verb presence', () => {
    const v = new HaikuValidatorService(
      makeNL({ getPOSTags: () => [{ word: 'x', tag: 'NN' }] }),
      makeMarkov(),
    );
    const result = v.passesFullHaikuFilters(
      ['a', 'b', 'c'],
      [0, 1, 2],
      3,
      baseThresholds({ verbPresence: 0.99 }),
    );
    expect(result).toBeFalsy();
  });

  it('passes with permissive thresholds', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    expect(
      v.passesFullHaikuFilters(['a', 'b', 'c'], [0, 1, 2], 3, baseThresholds()),
    ).toBeTruthy();
  });

  it('resetRejectionStats zeroes counters', () => {
    const v = new HaikuValidatorService(
      makeNL({ analyzeSentiment: () => 0.1 }),
      makeMarkov(),
    );
    v.passesScoreValidation('q', baseThresholds({ sentiment: 0.5 }));
    expect(v.getRejectionStats().total).toBe(1);
    v.resetRejectionStats();
    expect(v.getRejectionStats().total).toBe(0);
  });
});

describe('HaikuValidatorService.isQuoteValidForVerse', () => {
  it('runs the full chain for the first verse with no selected verses', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    expect(
      v.isQuoteValidForVerse(
        candidate('quiet river', 0),
        true,
        [],
        baseThresholds(),
      ),
    ).toBeTruthy();
  });

  it('delegates to sequence validation when verses already selected', () => {
    const v = new HaikuValidatorService(makeNL(), makeMarkov());
    const ok = v.isQuoteValidForVerse(
      candidate('second verse', 1),
      false,
      [candidate('first verse', 0)],
      baseThresholds(),
    );
    expect(ok).toBeTruthy();
  });
});
