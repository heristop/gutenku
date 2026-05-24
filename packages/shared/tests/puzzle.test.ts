import { describe, expect, it } from 'vitest';
import { getPuzzleNumber } from '../src/utils/puzzle';

// GUTENGUESS_LAUNCH_DATE is '2026-01-01'.
describe('getPuzzleNumber', () => {
  it('returns 1 on the launch date', () => {
    expect(getPuzzleNumber('2026-01-01')).toBe(1);
  });

  it('returns 2 the day after launch', () => {
    expect(getPuzzleNumber('2026-01-02')).toBe(2);
  });

  it('increments by one per day across a longer span', () => {
    expect(getPuzzleNumber('2026-01-11')).toBe(11);
    expect(getPuzzleNumber('2026-02-01')).toBe(32);
  });

  it('returns 0 for the day before launch', () => {
    expect(getPuzzleNumber('2025-12-31')).toBe(0);
  });

  it('returns a negative number for dates well before launch', () => {
    expect(getPuzzleNumber('2025-12-22')).toBe(-9);
  });

  it('floors partial days within the same calendar day', () => {
    // Same day, later time -> still puzzle 1 (diff < 24h floors to 0, +1).
    expect(getPuzzleNumber('2026-01-01T23:59:59Z')).toBe(1);
  });
});
