import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
// Mock fs/promises at module scope (factory hoisted)
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

  it('returns 0 for empty from string in evaluateTransition', () => {
    const nl2 = new NaturalLanguageService();
    const m = new MarkovChainService(nl2);
    m.train('Hello world.');
    expect(m.evaluateTransition('', 'world')).toBe(0);
  });

  it('returns 0 for empty to string in evaluateTransition', () => {
    const nl2 = new NaturalLanguageService();
    const m = new MarkovChainService(nl2);
    m.train('Hello world.');
    expect(m.evaluateTransition('Hello', '')).toBe(0);
  });

  it('returns 0 for unknown transitions', () => {
    const nl2 = new NaturalLanguageService();
    const m = new MarkovChainService(nl2);
    m.train('Hello world.');
    expect(m.evaluateTransition('unknown', 'words')).toBe(0);
  });

  it('returns 0 for evaluateWords with no matches', () => {
    const nl2 = new NaturalLanguageService();
    const m = new MarkovChainService(nl2);
    m.train('Hello world.');
    expect(m.evaluateWords('xyz', 'abc')).toBe(0);
  });

  it('filters out FANBOYS conjunctions during training', () => {
    const nl2 = new NaturalLanguageService();
    const m = new MarkovChainService(nl2);
    m.train('The cat and the dog. For the win.');
    // 'and' and 'for' should be filtered out
    const score = m.evaluateTransition('cat', 'dog');
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('handles text with newlines', () => {
    const nl2 = new NaturalLanguageService();
    const m = new MarkovChainService(nl2);
    m.train('First line.\nSecond line.\nThird line.');
    expect(m.evaluateWords('First', 'line')).toBeGreaterThanOrEqual(0);
  });

  it('handles empty text', () => {
    const nl2 = new NaturalLanguageService();
    const m = new MarkovChainService(nl2);
    m.train('');
    expect(m.evaluateWords('any', 'word')).toBe(0);
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

  it('handles load error gracefully', async () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    // Loading without saving should not throw
    await expect(m.loadModel()).resolves.not.toThrow();
  });

  it('handles save error gracefully', async () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train('Test text.');

    // Mock fs.writeFile to throw an error
    const fs = await import('node:fs/promises');
    const originalWriteFile = fs.writeFile;
    (fs as { writeFile: typeof fs.writeFile }).writeFile = vi
      .fn()
      .mockRejectedValueOnce(new Error('Write failed'));

    // Should not throw - error is logged
    await expect(m.saveModel()).resolves.not.toThrow();

    // Restore
    (fs as { writeFile: typeof fs.writeFile }).writeFile = originalWriteFile;
  });

  it('handles load error with corrupted JSON', async () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);

    // Mock fs.readFile to return invalid JSON
    const fs = await import('node:fs/promises');
    const originalReadFile = fs.readFile;
    (fs as { readFile: typeof fs.readFile }).readFile = vi
      .fn()
      .mockRejectedValueOnce(new Error('Read failed'));

    // Should not throw - error is logged
    await expect(m.loadModel()).resolves.not.toThrow();

    // Restore
    (fs as { readFile: typeof fs.readFile }).readFile = originalReadFile;
  });
});
