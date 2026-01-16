/**
 * Seeded random utilities for deterministic selection based on date seed.
 */

/**
 * Mulberry32 seeded PRNG for deterministic random selection.
 * Returns a function that generates pseudo-random numbers between 0 and 1.
 */
export function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert date string (YYYY-MM-DD) to numeric seed.
 * Example: "2026-01-06" -> 20260106
 */
export function dateToSeed(dateStr: string): number {
  if (!dateStr) {
    return 0;
  }
  const [year, month, day] = dateStr.split('-').map(Number);

  return year * 10000 + month * 100 + day;
}

/**
 * Fisher-Yates shuffle with seeded random.
 * Returns a new shuffled array without modifying the original.
 */
export function shuffleWithSeed<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get today's date in YYYY-MM-DD format (UTC).
 */
export function getTodayUTC(): string {
  return new Date().toISOString().split('T')[0];
}
