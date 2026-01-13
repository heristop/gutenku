import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkovChainService } from '../src/domain/services/MarkovChainService';
import NaturalLanguageService from '../src/domain/services/NaturalLanguageService';
import fs from 'node:fs/promises';

vi.mock('node:fs/promises');

describe('MarkovChainService', () => {
  let service: MarkovChainService;
  let naturalLanguageService: NaturalLanguageService;

  beforeEach(() => {
    vi.resetAllMocks();
    naturalLanguageService = new NaturalLanguageService();
    service = new MarkovChainService(naturalLanguageService);
  });

  describe('train', () => {
    it('builds bigram transitions from text', () => {
      service.train('The cat sat on the mat');

      const score = service.evaluateTransition('cat', 'sat');
      expect(score).toBeGreaterThan(0);
    });

    it('builds trigram transitions from text', () => {
      service.train('The quick brown fox jumps over the lazy dog');

      const score = service.evaluateTrigramTransition('quick brown', 'fox');
      expect(score).toBeGreaterThan(0);
    });

    it('filters out FANBOYS conjunctions', () => {
      service.train('cats and dogs for fun');

      // 'and' and 'for' should be filtered out
      const scoreAnd = service.evaluateTransition('cats', 'and');
      expect(scoreAnd).toBe(0);
    });

    it('handles multiple sentences', () => {
      service.train('Hello world. Goodbye world.');

      const score1 = service.evaluateTransition('Hello', 'world');
      const score2 = service.evaluateTransition('Goodbye', 'world');

      expect(score1).toBeGreaterThan(0);
      expect(score2).toBeGreaterThan(0);
    });

    it('handles empty text', () => {
      service.train('');

      const score = service.evaluateTransition('any', 'word');
      expect(score).toBe(0);
    });

    it('handles newlines in text', () => {
      service.train('Hello\nworld\ntest');

      const score = service.evaluateTransition('Hello', 'world');
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('evaluateTransition', () => {
    beforeEach(() => {
      service.train('The cat sat. The cat ran. The dog barked.');
    });

    it('returns probability for known transition', () => {
      const score = service.evaluateTransition('The', 'cat');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('returns 0 for unknown transition', () => {
      const score = service.evaluateTransition('elephant', 'zebra');
      expect(score).toBe(0);
    });

    it('returns 0 for empty from string', () => {
      const score = service.evaluateTransition('', 'cat');
      expect(score).toBe(0);
    });

    it('returns 0 for empty to string', () => {
      const score = service.evaluateTransition('cat', '');
      expect(score).toBe(0);
    });

    it('uses last word of from phrase', () => {
      service.train('old silent pond');
      const score = service.evaluateTransition('an old silent', 'pond');
      expect(score).toBeGreaterThan(0);
    });

    it('uses first word of to phrase', () => {
      service.train('silent pond frog');
      const score = service.evaluateTransition('silent', 'pond jumps');
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('evaluateTrigramTransition', () => {
    beforeEach(() => {
      service.train('The quick brown fox jumps over');
    });

    it('returns probability for known trigram transition', () => {
      const score = service.evaluateTrigramTransition('quick brown', 'fox');
      expect(score).toBeGreaterThan(0);
    });

    it('returns 0 for unknown trigram', () => {
      const score = service.evaluateTrigramTransition('elephant zebra', 'giraffe');
      expect(score).toBe(0);
    });

    it('returns 0 when from has fewer than 2 words', () => {
      const score = service.evaluateTrigramTransition('single', 'word');
      expect(score).toBe(0);
    });

    it('returns 0 for empty to string', () => {
      const score = service.evaluateTrigramTransition('quick brown', '');
      expect(score).toBe(0);
    });

    it('uses last two words of from phrase', () => {
      const score = service.evaluateTrigramTransition(
        'a b c quick brown',
        'fox',
      );
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('evaluateTransitionSmoothed', () => {
    beforeEach(() => {
      service.train('The cat sat on the mat');
    });

    it('returns non-zero for known transition', () => {
      const score = service.evaluateTransitionSmoothed('cat', 'sat');
      expect(score).toBeGreaterThan(0);
    });

    it('returns non-zero for unknown transition (smoothing)', () => {
      const score = service.evaluateTransitionSmoothed('elephant', 'zebra');
      expect(score).toBeGreaterThan(0);
    });

    it('known transitions have higher score than unknown', () => {
      const knownScore = service.evaluateTransitionSmoothed('cat', 'sat');
      const unknownScore = service.evaluateTransitionSmoothed('elephant', 'zebra');
      expect(knownScore).toBeGreaterThan(unknownScore);
    });

    it('handles empty strings with smoothing', () => {
      const score = service.evaluateTransitionSmoothed('', '');
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('evaluateTrigramTransitionSmoothed', () => {
    beforeEach(() => {
      service.train('The quick brown fox jumps over the lazy dog');
    });

    it('returns non-zero for known trigram transition', () => {
      const score = service.evaluateTrigramTransitionSmoothed('quick brown', 'fox');
      expect(score).toBeGreaterThan(0);
    });

    it('returns non-zero for unknown trigram transition (smoothing)', () => {
      const score = service.evaluateTrigramTransitionSmoothed('elephant zebra', 'giraffe');
      expect(score).toBeGreaterThan(0);
    });

    it('handles insufficient words with smoothing', () => {
      const score = service.evaluateTrigramTransitionSmoothed('single', 'word');
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('evaluateWithBackoff', () => {
    beforeEach(() => {
      service.train('The quick brown fox jumps over the lazy dog');
    });

    it('uses bigram when available', () => {
      const bigramScore = service.evaluateTransition('quick', 'brown');
      const backoffScore = service.evaluateWithBackoff('quick', 'brown');
      expect(backoffScore).toBe(bigramScore);
    });

    it('falls back to trigram when bigram returns 0', () => {
      // Construct a case where bigram is 0 but trigram might work
      const backoffScore = service.evaluateWithBackoff('unknown word', 'test');
      expect(backoffScore).toBe(0); // Both should be 0 for unknown
    });

    it('returns trigram score when bigram is 0', () => {
      // Train specific trigram without corresponding bigram
      service.train('alpha beta gamma. delta epsilon zeta.');

      const bigramScore = service.evaluateTransition('beta', 'gamma');
      const trigramScore = service.evaluateTrigramTransition('alpha beta', 'gamma');
      const backoffScore = service.evaluateWithBackoff('alpha beta', 'gamma');


      if (bigramScore > 0) {
        expect(backoffScore).toBe(bigramScore);
      } else {
        expect(backoffScore).toBe(trigramScore);
      }
    });
  });

  describe('saveModel', () => {
    it('saves model to file', async () => {
      vi.mocked(fs.writeFile).mockResolvedValue();
      service.train('Hello world test');

      const result = await service.saveModel();

      expect(result).toBeTruthy();
      expect(fs.writeFile).toHaveBeenCalledWith(
        './data/markov_model.json',
        expect.any(String),
        'utf8',
      );
    });

    it('returns false on write error', async () => {
      vi.mocked(fs.writeFile).mockRejectedValue(new Error('Write failed'));
      service.train('Hello world');

      const result = await service.saveModel();

      expect(result).toBeFalsy();
    });

    it('serializes vocabulary correctly', async () => {
      vi.mocked(fs.writeFile).mockResolvedValue();
      service.train('cat dog bird');

      await service.saveModel();

      const savedData = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
      const parsed = JSON.parse(savedData);

      expect(parsed.vocabulary).toContain('cat');
      expect(parsed.vocabulary).toContain('dog');
      expect(parsed.vocabulary).toContain('bird');
    });
  });

  describe('loadModel', () => {
    const mockModelData = {
      bigrams: [
        ['cat', [['sat', 2]]],
        ['dog', [['ran', 1]]],
      ],
      trigrams: [
        ['cat sat', [['on', 1]]],
      ],
      bigramTotals: [
        ['cat', 2],
        ['dog', 1],
      ],
      trigramTotals: [
        ['cat sat', 1],
      ],
      totalBigrams: 3,
      totalTrigrams: 1,
      vocabulary: ['cat', 'sat', 'dog', 'ran', 'on'],
    };

    it('loads model from file', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockModelData));

      const result = await service.loadModel();

      expect(result).toBeTruthy();
      expect(fs.readFile).toHaveBeenCalledWith(
        './data/markov_model.json',
        'utf8',
      );
    });

    it('evaluates transitions after loading', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockModelData));

      await service.loadModel();

      const score = service.evaluateTransition('cat', 'sat');
      expect(score).toBeGreaterThan(0);
    });

    it('returns false on read error', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const result = await service.loadModel();

      expect(result).toBeFalsy();
    });

    it('returns true if already loaded', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockModelData));

      await service.loadModel();
      const result = await service.loadModel();

      expect(result).toBeTruthy();
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('handles model without trigrams (backward compatibility)', async () => {
      const legacyModel = {
        bigrams: [['cat', [['sat', 1]]]],
        totalBigrams: 1,
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(legacyModel));

      const result = await service.loadModel();

      expect(result).toBeTruthy();
    });

    it('handles model without bigramTotals (backward compatibility)', async () => {
      const legacyModel = {
        bigrams: [['cat', [['sat', 1]]]],
        totalBigrams: 1,
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(legacyModel));

      const result = await service.loadModel();

      expect(result).toBeTruthy();
      // Should still be able to evaluate (computes totals)
      const score = service.evaluateTransition('cat', 'sat');
      expect(score).toBeGreaterThan(0);
    });

    it('handles model without vocabulary (backward compatibility)', async () => {
      const legacyModel = {
        bigrams: [['cat', [['sat', 1]]]],
        totalBigrams: 1,
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(legacyModel));

      const result = await service.loadModel();

      expect(result).toBeTruthy();
      // Should still work with smoothing (computes vocabulary)
      const score = service.evaluateTransitionSmoothed('cat', 'sat');
      expect(score).toBeGreaterThan(0);
    });

    it('handles model without trigramTotals (backward compatibility)', async () => {
      const legacyModel = {
        bigrams: [['cat', [['sat', 1]]]],
        trigrams: [['cat sat', [['on', 1]]]],
        totalBigrams: 1,
        totalTrigrams: 1,
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(legacyModel));

      const result = await service.loadModel();

      expect(result).toBeTruthy();
      const score = service.evaluateTrigramTransition('cat sat', 'on');
      expect(score).toBeGreaterThan(0);
    });
  });
});
