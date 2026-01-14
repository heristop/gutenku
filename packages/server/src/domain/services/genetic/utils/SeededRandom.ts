import seedrandom from 'seedrandom';

/**
 * Seeded random number generator for deterministic GA runs
 */
export class SeededRandom {
  private rng: seedrandom.PRNG;
  private callCount: number = 0;

  constructor(seed?: string) {
    this.rng = seed ? seedrandom(seed) : seedrandom();
  }

  /**
   * Random float [0, 1)
   */
  next(): number {
    this.callCount++;
    return this.rng();
  }

  /**
   * Random integer [min, max)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Random boolean with probability p
   */
  nextBool(p: number = 0.5): boolean {
    return this.next() < p;
  }

  /**
   * Shuffle array (Fisher-Yates)
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Sample k items from array without replacement
   */
  sample<T>(array: T[], k: number): T[] {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, k);
  }

  /**
   * Get call count for debugging/testing
   */
  getCallCount(): number {
    return this.callCount;
  }

  /**
   * Reset with new seed
   */
  reset(seed?: string): void {
    this.rng = seed ? seedrandom(seed) : seedrandom();
    this.callCount = 0;
  }
}
