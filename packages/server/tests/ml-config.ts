import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  getMLConfig,
  DEFAULT_SCORING_CONFIG,
  DEFAULT_TENSORFLOW_CONFIG,
} from '../src/config/ml';

describe('ML Configuration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getMLConfig', () => {
    it('returns default scoring config when no env vars set', () => {
      delete process.env.ML_SCORING_MODE;
      delete process.env.ML_RULE_WEIGHT;
      delete process.env.ML_NEURAL_WEIGHT;

      const config = getMLConfig();

      expect(config.scoring.mode).toBe('rule-based');
      expect(config.scoring.ruleWeight).toBe(0.6);
      expect(config.scoring.neuralWeight).toBe(0.4);
    });

    it('respects ML_SCORING_MODE env var', () => {
      process.env.ML_SCORING_MODE = 'hybrid';

      const config = getMLConfig();

      expect(config.scoring.mode).toBe('hybrid');
    });

    it('respects ML_SCORING_MODE=neural', () => {
      process.env.ML_SCORING_MODE = 'neural';

      const config = getMLConfig();

      expect(config.scoring.mode).toBe('neural');
    });

    it('respects ML_RULE_WEIGHT env var', () => {
      process.env.ML_RULE_WEIGHT = '0.8';

      const config = getMLConfig();

      expect(config.scoring.ruleWeight).toBe(0.8);
    });

    it('respects ML_NEURAL_WEIGHT env var', () => {
      process.env.ML_NEURAL_WEIGHT = '0.2';

      const config = getMLConfig();

      expect(config.scoring.neuralWeight).toBe(0.2);
    });

    it('returns default GPU config when ML_USE_GPU not set', () => {
      delete process.env.ML_USE_GPU;

      const config = getMLConfig();

      expect(config.tensorflow.useGPU).toBe(false);
      expect(config.tensorflow.backend).toBe('tensorflow');
    });

    it('enables GPU when ML_USE_GPU=true', () => {
      process.env.ML_USE_GPU = 'true';

      const config = getMLConfig();

      expect(config.tensorflow.useGPU).toBe(true);
      expect(config.tensorflow.backend).toBe('tensorflow-gpu');
    });
  });

  describe('DEFAULT_SCORING_CONFIG', () => {
    it('has correct default values', () => {
      expect(DEFAULT_SCORING_CONFIG.mode).toBe('rule-based');
      expect(DEFAULT_SCORING_CONFIG.ruleWeight).toBe(0.6);
      expect(DEFAULT_SCORING_CONFIG.neuralWeight).toBe(0.4);
    });

    it('weights sum to 1.0', () => {
      const sum =
        DEFAULT_SCORING_CONFIG.ruleWeight + DEFAULT_SCORING_CONFIG.neuralWeight;
      expect(sum).toBe(1.0);
    });
  });

  describe('DEFAULT_TENSORFLOW_CONFIG', () => {
    it('has fallback to CPU enabled', () => {
      expect(DEFAULT_TENSORFLOW_CONFIG.fallbackToCPU).toBe(true);
    });

    it('has memory optimization enabled', () => {
      expect(DEFAULT_TENSORFLOW_CONFIG.enableMemoryOptimization).toBe(true);
    });
  });
});
