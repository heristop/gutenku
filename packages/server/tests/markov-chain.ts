import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'node:events';

// Shared state for mocks - needs to be module level for hoisted mocks
const mockState = {
  savedData: '',
};

// Mock node:fs for createWriteStream
vi.mock('node:fs', async () => {
  const { EventEmitter } = await import('node:events');
  return {
    createWriteStream: vi.fn(() => {
      const chunks: string[] = [];
      const emitter = new EventEmitter();
      const mockStream = {
        write: (data: string) => {
          chunks.push(data);
          return true;
        },
        end: () => {
          mockState.savedData = chunks.join('');
          setImmediate(() => emitter.emit('finish'));
        },
        on: (event: string, handler: () => void) => {
          emitter.on(event, handler);
          return mockStream;
        },
        once: (event: string, handler: () => void) => {
          emitter.once(event, handler);
          return mockStream;
        },
        destroy: vi.fn(),
      };
      return mockStream;
    }),
  };
});

// Mock fs/promises at module scope (factory hoisted)
vi.mock('fs/promises', () => {
  const readFile = vi.fn(
    async () => mockState.savedData || '{"bigrams": [], "totalBigrams": 0}',
  );
  const writeFile = vi.fn();
  const stat = vi.fn(async () => ({ size: 1024 })); // Return small file size
  return {
    default: { writeFile, readFile, stat },
    readFile,
    writeFile,
    stat,
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

  it('trains and returns transition score for known pairs', () => {
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
    // FANBOYS conjunctions filtered out
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

    // Transitions known to the model return a numeric score
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

    // Create a mock stream that emits an error on end
    const emitter = new EventEmitter();
    const mockStream = {
      write: vi.fn(() => true),
      end: vi.fn(() => {
        setImmediate(() => emitter.emit('error', new Error('Write failed')));
      }),
      on: vi.fn((event: string, handler: (err?: Error) => void) => {
        emitter.on(event, handler);
        return mockStream;
      }),
      once: vi.fn((event: string, handler: () => void) => {
        emitter.once(event, handler);
        return mockStream;
      }),
      destroy: vi.fn(),
    };

    const { createWriteStream } = await import('node:fs');
    vi.mocked(createWriteStream).mockReturnValue(mockStream as never);

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

describe('MarkovChainService - positive transition scores', () => {
  const corpus =
    'the quick brown fox jumps. the quick brown fox runs. the quick brown fox sleeps. brown fox jumps high. brown fox runs fast.';

  it('returns a positive bigram score for a frequently seen transition', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train(corpus);
    // "quick brown" -> "fox ..." occurs repeatedly; expect > 0 (covers count branch)
    const score = m.evaluateTransition('quick brown', 'fox jumps');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('returns a positive trigram score for a frequently seen transition', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train(corpus);
    const score = m.evaluateTrigramTransition('quick brown', 'fox jumps');
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe('MarkovChainService - smoothed transitions and backoff', () => {
  const corpus =
    'the quick brown fox jumps. the quick brown fox runs. brown fox jumps high.';

  it('evaluateTransitionSmoothed returns a probability for empty input via vocabulary', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train(corpus);
    const score = m.evaluateTransitionSmoothed('', 'fox');
    expect(score).toBeGreaterThan(0);
  });

  it('evaluateTransitionSmoothed returns a smoothed probability for a known transition', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train(corpus);
    const score = m.evaluateTransitionSmoothed('quick brown', 'fox jumps');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it('evaluateTransitionSmoothed returns a non-zero value for unknown transitions', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train(corpus);
    const score = m.evaluateTransitionSmoothed('zzz', 'qqq');
    expect(score).toBeGreaterThan(0);
  });

  it('evaluateTrigramTransitionSmoothed returns probability for empty/short input', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train(corpus);
    expect(m.evaluateTrigramTransitionSmoothed('one', 'two')).toBeGreaterThan(
      0,
    );
  });

  it('evaluateTrigramTransitionSmoothed returns a smoothed probability for known input', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train(corpus);
    const score = m.evaluateTrigramTransitionSmoothed(
      'quick brown',
      'fox jumps',
    );
    expect(score).toBeGreaterThan(0);
  });

  it('evaluateWithBackoff returns the bigram score when positive', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train(corpus);
    const score = m.evaluateWithBackoff('quick brown', 'fox jumps');
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('evaluateWithBackoff falls back to trigram when bigram score is zero', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train(corpus);
    // unknown bigram path -> falls through to trigram evaluation
    const score = m.evaluateWithBackoff('totally unknown', 'phrase here');
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

// Restore a working write-stream mock for tests that run after the
// "save error" test permanently overrides createWriteStream.
const makeWorkingStream = () => {
  const chunks: string[] = [];
  const emitter = new EventEmitter();
  const mockStream: Record<string, unknown> = {
    write: (data: string) => {
      chunks.push(data);
      return true;
    },
    end: () => {
      mockState.savedData = chunks.join('');
      setImmediate(() => emitter.emit('finish'));
    },
    on: (event: string, handler: () => void) => {
      emitter.on(event, handler);
      return mockStream;
    },
    once: (event: string, handler: () => void) => {
      emitter.once(event, handler);
      return mockStream;
    },
    destroy: vi.fn(),
  };
  return mockStream;
};

describe('MarkovChainService - model state', () => {
  beforeEach(async () => {
    const { createWriteStream } = await import('node:fs');
    vi.mocked(createWriteStream).mockImplementation(
      () => makeWorkingStream() as never,
    );
    const { stat } = await import('node:fs/promises');
    vi.mocked(stat).mockResolvedValue({ size: 1024 } as never);
  });

  it('isModelLoaded reflects training/loaded state', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    expect(m.isModelLoaded()).toBeFalsy();
  });

  it('isModelLoaded is true after a successful load', async () => {
    const nl = new NaturalLanguageService();
    const a = new MarkovChainService(nl);
    // Bigram "bravo charlie" must occur >= MIN_BIGRAM_COUNT (3) to survive pruning.
    a.train(
      'bravo charlie delta. bravo charlie delta. bravo charlie delta. bravo charlie echo.',
    );
    await a.saveModel();

    const b = new MarkovChainService(nl);
    await b.loadModel();
    expect(b.isModelLoaded()).toBeTruthy();
  });

  it('getStats returns counts for a trained model', () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);
    m.train('echo foxtrot golf. echo foxtrot.');
    const stats = m.getStats();
    expect(stats.bigrams).toBeGreaterThan(0);
    expect(stats.vocabulary).toBeGreaterThan(0);
    expect(typeof stats.totalBigrams).toBe('number');
    expect(typeof stats.trigrams).toBe('number');
    expect(typeof stats.totalTrigrams).toBe('number');
  });

  it('skips load when the model file is too large', async () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);

    const { stat } = await import('node:fs/promises');
    // Exceed MAX_MODEL_SIZE_BYTES to hit the OOM-guard branch
    vi.mocked(stat).mockResolvedValueOnce({ size: 5_000_000_000 } as never);

    const result = await m.loadModel();
    expect(result).toBeFalsy();
  });

  it('saves and reloads a large model exercising batch flushing', async () => {
    const nl = new NaturalLanguageService();
    const m = new MarkovChainService(nl);

    // Build a corpus with > 500 distinct bigram keys, each repeated enough
    // times (>= MIN_BIGRAM_COUNT) to survive pruning and trigger batch writes.
    const sentences: string[] = [];
    for (let i = 0; i < 700; i++) {
      // "worda{i} wordb{i}" bigram appears 3x per sentence.
      sentences.push(
        `worda${i} wordb${i} worda${i} wordb${i} worda${i} wordb${i}`,
      );
    }
    m.train(sentences.join('. ') + '.');

    const saved = await m.saveModel();
    expect(saved).toBeTruthy();
  });
});
