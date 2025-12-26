import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';

vi.mock('fs/promises', () => {
  let data: string | undefined;
  const writeFile = vi.fn(async (_path: string, content: string) => {
    data = content;
  });
  const readFile = vi.fn(
    async (_path: string) => data ?? '{"bigrams": [], "totalBigrams": 0}',
  );
  return {
    default: { writeFile, readFile },
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
    // Single verse results in division by 0 (haiku.length - 1 = 0), producing NaN
    expect(Number.isNaN(score)).toBeTruthy();
  });

  it('evaluateHaiku handles two verse haiku', () => {
    const markovChain = new MarkovChainService(nl);
    const evaluator = new MarkovEvaluatorService(markovChain);

    evaluator.trainMarkovChain('The quick fox. Fox runs fast.');

    const score = evaluator.evaluateHaiku(['The quick', 'fox runs']);
    expect(typeof score).toBe('number');
  });

  it('save delegates to markovChain.saveModel', async () => {
    const markovChain = new MarkovChainService(nl);
    const evaluator = new MarkovEvaluatorService(markovChain);

    const saveSpy = vi.spyOn(markovChain, 'saveModel');
    await evaluator.save();
    expect(saveSpy).toHaveBeenCalled();
  });

  it('load delegates to markovChain.loadModel', async () => {
    const markovChain = new MarkovChainService(nl);
    const evaluator = new MarkovEvaluatorService(markovChain);

    const loadSpy = vi.spyOn(markovChain, 'loadModel');
    await evaluator.load();
    expect(loadSpy).toHaveBeenCalled();
  });
});
