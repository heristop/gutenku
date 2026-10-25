import { describe, expect, it } from 'vitest';
import {
  bestScoreLabel,
  etaLabel,
} from '@/features/haiku/composables/progress-readout';

describe('progress readout', () => {
  it('shows an ETA only while time remains', () => {
    expect(etaLabel(null)).toBeNull();
    expect(etaLabel(0)).toBeNull();
    expect(etaLabel(12)).toBe('~12s');
  });

  it('reads the best score as a whole number', () => {
    expect(bestScoreLabel(11.2)).toBe(11);
    expect(bestScoreLabel(11.6)).toBe(12);
  });

  it('says nothing of a best before any candidate has scored', () => {
    expect(bestScoreLabel(0)).toBe(null);
  });
});
