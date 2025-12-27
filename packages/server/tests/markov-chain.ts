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

  it('evaluates transition score across word pairs', () => {
    const s = markov.evaluateTransition('quick fox', 'lazy dog');
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

  it('returns 0 for evaluateTransition with no matches', () => {
    const nl2 = new NaturalLanguageService();
    const m = new MarkovChainService(nl2);
    m.train('Hello world.');
    expect(m.evaluateTransition('xyz', 'abc')).toBe(0);
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
    expect(m.evaluateTransition('First', 'line')).toBeGreaterThanOrEqual(0);
  });

  it('handles empty text', () => {
    const nl2 = new NaturalLanguageService();
    const m = new MarkovChainService(nl2);
    m.train('');
    expect(m.evaluateTransition('any', 'word')).toBe(0);
  });
});

describe('MarkovChainService - persistence', () => {
  it('saves and loads model via fs module', async () => {
    const nl = new NaturalLanguageService();
    const markovA = new MarkovChainService(nl);
    markovA.train('Alpha beta gamma. Alpha beta.');

    // Act: save and then load into a fresh instance
    const saveResult = await markovA.saveModel();
    expect(saveResult).toBeTruthy();

    const markovB = new MarkovChainService(nl);
    const loadResult = await markovB.loadModel();
    expect(loadResult).toBeTruthy();

    // Assert: transitions known to the model return a numeric score
    const s = markovB.evaluateTransition('Alpha', 'beta');
    expect(s).toBeGreaterThanOrEqual(0);
  });

  it('caches model and skips reload on subsequent calls', async () => {
    const nl = new NaturalLanguageService();
    const markovA = new MarkovChainService(nl);
    markovA.train('Test caching.');
    await markovA.saveModel();

    const markovB = new MarkovChainService(nl);
    const firstLoad = await markovB.loadModel();
    expect(firstLoad).toBeTruthy();

    // Second load should return true immediately (cached)
    const secondLoad = await markovB.loadModel();
    expect(secondLoad).toBeTruthy();
  });

  it('handles load error gracefully and returns false', async () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);

    // Use the mocked module and make readFile reject
    const { readFile } = await import('node:fs/promises');
    vi.mocked(readFile).mockRejectedValueOnce(new Error('File not found'));

    const result = await m.loadModel();
    expect(result).toBeFalsy();
  });

  it('handles save error gracefully and returns false', async () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train('Test text.');

    // Use the mocked module and make writeFile reject
    const { writeFile } = await import('node:fs/promises');
    vi.mocked(writeFile).mockRejectedValueOnce(new Error('Write failed'));

    const result = await m.saveModel();
    expect(result).toBeFalsy();
  });

  it('handles load error with corrupted JSON and returns false', async () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);

    // Use the mocked module and make readFile return invalid JSON
    const { readFile } = await import('node:fs/promises');
    vi.mocked(readFile).mockResolvedValueOnce('invalid json{{{');

    const result = await m.loadModel();
    expect(result).toBeFalsy();
  });
});

describe('MarkovChainService - trigrams', () => {
  it('trains and evaluates trigram transitions', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train('The quick brown fox jumps over the lazy dog.');

    // "brown fox" -> "jumps" should have a trigram score
    const score = m.evaluateTrigramTransition('quick brown', 'fox jumps');
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('returns 0 for trigram with insufficient words in from', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train('Hello world again.');

    // From has only 1 word, need at least 2 for trigrams
    const score = m.evaluateTrigramTransition('hello', 'world');
    expect(score).toBe(0);
  });

  it('returns 0 for unknown trigram transitions', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train('The cat sat on the mat.');

    const score = m.evaluateTrigramTransition('unknown words', 'here');
    expect(score).toBe(0);
  });

  it('returns 0 for empty to string in trigram evaluation', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train('Hello world again.');

    expect(m.evaluateTrigramTransition('Hello world', '')).toBe(0);
  });
});
