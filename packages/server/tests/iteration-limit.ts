import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import {
  MAX_ITERATIONS,
  clampIterations,
} from '~/application/queries/haiku/GenerateHaikuIterativeHandler';

describe('clampIterations', () => {
  it('keeps a request inside what the crafting panel offers', () => {
    expect(MAX_ITERATIONS).toBe(50);
    expect(clampIterations(10)).toBe(10);
    expect(clampIterations(100_000)).toBe(50);
  });

  it('never runs fewer than one, whatever arrives', () => {
    expect(clampIterations(0)).toBe(1);
    expect(clampIterations(-5)).toBe(1);
    expect(clampIterations(Number.NaN)).toBe(1);
    expect(clampIterations(7.8)).toBe(7);
  });
});
