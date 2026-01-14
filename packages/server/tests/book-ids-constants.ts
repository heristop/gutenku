import { describe, expect, it } from 'vitest';
import { BOOK_IDS } from '../src/shared/constants/book-ids';

describe('BOOK_IDS constants', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(BOOK_IDS)).toBeTruthy();
    expect(BOOK_IDS.length).toBeGreaterThan(0);
  });

  it('contains only positive integers', () => {
    for (const id of BOOK_IDS) {
      expect(Number.isInteger(id)).toBeTruthy();
      expect(id).toBeGreaterThan(0);
    }
  });

  it('has no duplicate IDs', () => {
    const uniqueIds = new Set(BOOK_IDS);
    expect(uniqueIds.size).toBe(BOOK_IDS.length);
  });

  it('contains expected classic books', () => {
    // Alice's Adventures in Wonderland
    expect(BOOK_IDS).toContain(11);
    // Pride and Prejudice
    expect(BOOK_IDS).toContain(1342);
    // Moby Dick
    expect(BOOK_IDS).toContain(2701);
    // Dracula
    expect(BOOK_IDS).toContain(345);
  });

  it('has reasonable number of books for gameplay', () => {
    expect(BOOK_IDS.length).toBeGreaterThanOrEqual(80);
    expect(BOOK_IDS.length).toBeLessThan(500);
  });
});
