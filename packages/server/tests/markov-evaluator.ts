import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';

vi.mock('node:fs/promises', () => {
  let data: string | undefined;
  const stat = vi.fn(async () => ({ size: 1000 }));
  const writeFile = vi.fn(async (_path: string, content: string) => {
    data = content;
  });
  const readFile = vi.fn(
    async (_path: string) =>
      data ?? JSON.stringify({ bigrams: {}, trigrams: {}, vocabulary: [] }),
  );
  return {
    default: { stat, writeFile, readFile },
    stat,
    readFile,
    writeFile,
  };
});

import NaturalLanguageService from '../src/domain/services/NaturalLanguageService';
import { MarkovChainService } from '../src/domain/services/MarkovChainService';
import { MarkovEvaluatorService } from '../src/domain/services/MarkovEvaluatorService';

describe('MarkovEvaluatorService', () => {
  const nl = new NaturalLanguageService();

  it('trainMarkovChain returns this for chaining', () => {
    const markovChain = new MarkovChainService(nl);
    const evaluator = new MarkovEvaluatorService(markovChain);

    const result = evaluator.trainMarkovChain('The quick brown fox.');
    expect(result).toBe(evaluator);
  });

  it('evaluateHaiku returns normalized score', () => {
    const markovChain = new MarkovChainService(nl);
    const evaluator = new MarkovEvaluatorService(markovChain);

    evaluator.trainMarkovChain(
      'The quick brown fox jumps. The fox runs fast. Quick fox.',
    );

    const score = evaluator.evaluateHaiku([
      'The quick brown',
      'fox jumps over',
      'the lazy dog',
    ]);

    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('evaluateHaiku handles single verse haiku', () => {
    const markovChain = new MarkovChainService(nl);
    const evaluator = new MarkovEvaluatorService(markovChain);

    evaluator.trainMarkovChain('Test text.');

    const score = evaluator.evaluateHaiku(['single verse']);
    // Single verse now returns 0 instead of NaN
    expect(score).toBe(0);
  });

  it('evaluateHaiku handles empty haiku', () => {
    const markovChain = new MarkovChainService(nl);
    const evaluator = new MarkovEvaluatorService(markovChain);

    const score = evaluator.evaluateHaiku([]);
    expect(score).toBe(0);
  });

  it('evaluateHaiku handles two verse haiku', () => {
    const markovChain = new MarkovChainService(nl);
    const evaluator = new MarkovEvaluatorService(markovChain);

    evaluator.trainMarkovChain('The quick fox. Fox runs fast.');

    const score = evaluator.evaluateHaiku(['The quick', 'fox runs']);
    expect(typeof score).toBe('number');
  });

  it('save delegates to markovChain.saveModel and returns boolean', async () => {
    const markovChain = new MarkovChainService(nl);
    const evaluator = new MarkovEvaluatorService(markovChain);

    const saveSpy = vi.spyOn(markovChain, 'saveModel');
    const result = await evaluator.save();
    expect(saveSpy).toHaveBeenCalled();
    expect(typeof result).toBe('boolean');
  });

  it('load delegates to markovChain.loadModel and returns boolean', async () => {
    const markovChain = new MarkovChainService(nl);
    const evaluator = new MarkovEvaluatorService(markovChain);

    const loadSpy = vi.spyOn(markovChain, 'loadModel');
    const result = await evaluator.load();
    expect(loadSpy).toHaveBeenCalled();
    expect(typeof result).toBe('boolean');
  });

  describe('evaluateHaikuTrigrams', () => {
    it('returns normalized trigram score for valid haiku', () => {
      const markovChain = new MarkovChainService(nl);
      const evaluator = new MarkovEvaluatorService(markovChain);

      evaluator.trainMarkovChain(
        'The quick brown fox jumps over the lazy dog. The fox runs fast.',
      );

      const score = evaluator.evaluateHaikuTrigrams([
        'The quick brown',
        'fox jumps over',
        'the lazy dog',
      ]);

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('returns 0 for single verse haiku', () => {
      const markovChain = new MarkovChainService(nl);
      const evaluator = new MarkovEvaluatorService(markovChain);

      evaluator.trainMarkovChain('Test text.');

      const score = evaluator.evaluateHaikuTrigrams(['single verse']);
      expect(score).toBe(0);
    });

    it('returns 0 for empty haiku', () => {
      const markovChain = new MarkovChainService(nl);
      const evaluator = new MarkovEvaluatorService(markovChain);

      const score = evaluator.evaluateHaikuTrigrams([]);
      expect(score).toBe(0);
    });

    it('handles two verse haiku correctly', () => {
      const markovChain = new MarkovChainService(nl);
      const evaluator = new MarkovEvaluatorService(markovChain);

      evaluator.trainMarkovChain('The quick fox runs fast over the hill.');

      const score = evaluator.evaluateHaikuTrigrams([
        'The quick fox',
        'runs fast over',
      ]);
      expect(typeof score).toBe('number');
    });

    it('calculates average score across all transitions', () => {
      const markovChain = new MarkovChainService(nl);
      const evaluator = new MarkovEvaluatorService(markovChain);

      evaluator.trainMarkovChain(
        'Autumn leaves fall. Fall brings the cold. Cold winds blow.',
      );

      const score = evaluator.evaluateHaikuTrigrams([
        'Autumn leaves fall',
        'Fall brings cold',
        'Cold winds blow',
      ]);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(10);
    });
  });
});
