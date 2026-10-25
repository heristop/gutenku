import { describe, expect, it } from 'vitest';
import {
  bestScoreLabel,
  etaLabel,
  stepDirection,
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

  it('reads which way the reader turned through their haiku', () => {
    expect(stepDirection(3, 2)).toBe('back');
    expect(stepDirection(2, 3)).toBe('forward');
    // A new haiku lands at the end, like turning forward
    expect(stepDirection(3, 4)).toBe('forward');
  });
});
