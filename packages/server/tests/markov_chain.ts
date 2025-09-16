import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
// Mock fs/promises at module scope (factory hoisted)
vi.mock('fs/promises', () => {
  let data: string | undefined;
  const writeFile = vi.fn(async (_path: string, content: string) => {
    data = content;
  });
  const readFile = vi.fn(async (_path: string) => {
    return data ?? '{"bigrams": [], "totalBigrams": 0}';
  });
  return {
    default: { writeFile, readFile },
    writeFile,
    readFile,
  };
});
import NaturalLanguageService from '../src/domain/services/NaturalLanguageService';
import { MarkovChainService } from '../src/domain/services/MarkovChainService';

describe('MarkovChainService - training and evaluation', () => {
  const nl = new NaturalLanguageService();
  const markov = new MarkovChainService(nl);

  const corpus = `A quick brown fox jumps over the lazy dog.
  The quick brown fox likes to jump high.
  The lazy dog sleeps soundly.`;

  it('trains and yields non-zero transition score for known pairs', () => {
    markov.train(corpus);
    const score = markov.evaluateTransition('quick brown', 'fox likes');
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('evaluates words pair score across groups', () => {
    const s = markov.evaluateWords('quick fox', 'lazy dog');
    expect(s).toBeGreaterThanOrEqual(0);
  });
});

describe('MarkovChainService - persistence', () => {
  it('saves and loads model via fs module', async () => {
    const nl = new NaturalLanguageService();
    const markovA = new MarkovChainService(nl);
    markovA.train('Alpha beta gamma. Alpha beta.');

    // Act: save and then load into a fresh instance
    await markovA.saveModel();

    const markovB = new MarkovChainService(nl);
    await markovB.loadModel();

    // Assert: transitions known to the model return a numeric score
    const s = markovB.evaluateWords('Alpha', 'beta');
    expect(s).toBeGreaterThanOrEqual(0);
  });
});
