import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Tests for the frontend stats tracking logic.
 * This mirrors the updateStats function in packages/front/src/features/haiku/store/haiku.ts
 */

interface Stats {
  haikusGenerated: number;
  dailyHaikuViews: number;
  booksBrowsed: number;
  totalExecutionTime: number;
  books: string[];
  bookCounts: Record<string, number>;
}

interface MockHaiku {
  cacheUsed?: boolean;
  executionTime?: number;
  book?: {
    title?: string;
  };
}

function createInitialStats(): Stats {
  return {
    haikusGenerated: 0,
    dailyHaikuViews: 0,
    booksBrowsed: 0,
    totalExecutionTime: 0,
    books: [],
    bookCounts: {},
  };
}

/**
 * Mirrors the updateStats function from the haiku store
 */
function updateStats(
  stats: Stats,
  newHaiku: MockHaiku,
  isDailyHaiku: boolean,
): void {
  // Track daily haiku views
  if (isDailyHaiku) {
    stats.dailyHaikuViews += 1;
  } else if (newHaiku.cacheUsed !== true) {
    // Track crafted haikus (non-cached, non-daily)
    stats.haikusGenerated += 1;
    if (typeof newHaiku.executionTime === 'number') {
      stats.totalExecutionTime += newHaiku.executionTime;
    }
  }

  // Always track books (for both daily and crafted haikus)
  const bookTitle = newHaiku.book?.title?.trim();
  if (!bookTitle) {
    return;
  }

  if (!stats.books.includes(bookTitle)) {
    stats.books.push(bookTitle);
    stats.booksBrowsed = stats.books.length;
  }
  stats.bookCounts[bookTitle] = (stats.bookCounts[bookTitle] || 0) + 1;
}

describe('Stats Tracking', () => {
  let stats: Stats;

  beforeEach(() => {
    stats = createInitialStats();
  });

  describe('Daily haiku views', () => {
    it('should increment dailyHaikuViews when viewing daily haiku', () => {
      const haiku: MockHaiku = {
        cacheUsed: true,
        book: { title: 'Moby Dick' },
      };

      updateStats(stats, haiku, true);

      expect(stats.dailyHaikuViews).toBe(1);
      expect(stats.haikusGenerated).toBe(0);
    });

    it('should increment dailyHaikuViews multiple times', () => {
      const haiku: MockHaiku = {
        cacheUsed: true,
        book: { title: 'Moby Dick' },
      };

      updateStats(stats, haiku, true);
      updateStats(stats, haiku, true);
      updateStats(stats, haiku, true);

      expect(stats.dailyHaikuViews).toBe(3);
    });

    it('should track book when viewing daily haiku', () => {
      const haiku: MockHaiku = {
        cacheUsed: true,
        book: { title: 'Pride and Prejudice' },
      };

      updateStats(stats, haiku, true);

      expect(stats.booksBrowsed).toBe(1);
      expect(stats.books).toContain('Pride and Prejudice');
      expect(stats.bookCounts['Pride and Prejudice']).toBe(1);
    });

    it('should track unique books for daily haiku views', () => {
      updateStats(stats, { cacheUsed: true, book: { title: 'Book A' } }, true);
      updateStats(stats, { cacheUsed: true, book: { title: 'Book B' } }, true);
      updateStats(stats, { cacheUsed: true, book: { title: 'Book A' } }, true);

      expect(stats.dailyHaikuViews).toBe(3);
      expect(stats.booksBrowsed).toBe(2);
      expect(stats.bookCounts['Book A']).toBe(2);
      expect(stats.bookCounts['Book B']).toBe(1);
    });
  });

  describe('Crafted haikus', () => {
    it('should increment haikusGenerated for crafted haikus', () => {
      const haiku: MockHaiku = {
        cacheUsed: false,
        executionTime: 1.5,
        book: { title: 'War and Peace' },
      };

      updateStats(stats, haiku, false);

      expect(stats.haikusGenerated).toBe(1);
      expect(stats.dailyHaikuViews).toBe(0);
    });

    it('should track execution time for crafted haikus', () => {
      updateStats(
        stats,
        { cacheUsed: false, executionTime: 1.5, book: { title: 'Book A' } },
        false,
      );
      updateStats(
        stats,
        { cacheUsed: false, executionTime: 2, book: { title: 'Book B' } },
        false,
      );

      expect(stats.totalExecutionTime).toBe(3.5);
    });

    it('should track books for crafted haikus', () => {
      const haiku: MockHaiku = {
        cacheUsed: false,
        executionTime: 1,
        book: { title: '1984' },
      };

      updateStats(stats, haiku, false);

      expect(stats.booksBrowsed).toBe(1);
      expect(stats.books).toContain('1984');
    });

    it('should not increment haikusGenerated for cached non-daily haikus', () => {
      const haiku: MockHaiku = {
        cacheUsed: true,
        book: { title: 'Some Book' },
      };

      updateStats(stats, haiku, false);

      expect(stats.haikusGenerated).toBe(0);
      expect(stats.dailyHaikuViews).toBe(0);
    });
  });

  describe('Book tracking', () => {
    it('should only count unique books in booksBrowsed', () => {
      const haiku1: MockHaiku = {
        cacheUsed: false,
        book: { title: 'The Great Gatsby' },
      };
      const haiku2: MockHaiku = {
        cacheUsed: false,
        book: { title: 'The Great Gatsby' },
      };

      updateStats(stats, haiku1, false);
      updateStats(stats, haiku2, false);

      expect(stats.booksBrowsed).toBe(1);
      expect(stats.bookCounts['The Great Gatsby']).toBe(2);
    });

    it('should handle missing book title gracefully', () => {
      const haiku: MockHaiku = {
        cacheUsed: false,
        book: {},
      };

      updateStats(stats, haiku, false);

      expect(stats.haikusGenerated).toBe(1);
      expect(stats.booksBrowsed).toBe(0);
    });

    it('should handle missing book gracefully', () => {
      const haiku: MockHaiku = {
        cacheUsed: false,
      };

      updateStats(stats, haiku, false);

      expect(stats.haikusGenerated).toBe(1);
      expect(stats.booksBrowsed).toBe(0);
    });

    it('should trim book titles', () => {
      const haiku: MockHaiku = {
        cacheUsed: false,
        book: { title: '  Trimmed Title  ' },
      };

      updateStats(stats, haiku, false);

      expect(stats.books).toContain('Trimmed Title');
    });

    it('should track books for both daily and crafted haikus', () => {
      updateStats(
        stats,
        { cacheUsed: true, book: { title: 'Daily Book' } },
        true,
      );
      updateStats(
        stats,
        { cacheUsed: false, book: { title: 'Crafted Book' } },
        false,
      );

      expect(stats.booksBrowsed).toBe(2);
      expect(stats.dailyHaikuViews).toBe(1);
      expect(stats.haikusGenerated).toBe(1);
    });
  });

  describe('Mixed usage scenarios', () => {
    it('should correctly track a typical user session', () => {
      // User opens app, sees daily haiku
      updateStats(
        stats,
        { cacheUsed: true, book: { title: 'Pride and Prejudice' } },
        true,
      );

      // User crafts a new haiku
      updateStats(
        stats,
        {
          cacheUsed: false,
          executionTime: 1.2,
          book: { title: 'Moby Dick' },
        },
        false,
      );

      // User crafts another haiku from the same book
      updateStats(
        stats,
        {
          cacheUsed: false,
          executionTime: 0.8,
          book: { title: 'Moby Dick' },
        },
        false,
      );

      // User returns next day, sees new daily haiku
      updateStats(stats, { cacheUsed: true, book: { title: '1984' } }, true);

      expect(stats.dailyHaikuViews).toBe(2);
      expect(stats.haikusGenerated).toBe(2);
      expect(stats.booksBrowsed).toBe(3);
      expect(stats.totalExecutionTime).toBe(2);
      expect(stats.bookCounts['Moby Dick']).toBe(2);
      expect(stats.bookCounts['Pride and Prejudice']).toBe(1);
      expect(stats.bookCounts['1984']).toBe(1);
    });
  });
});
