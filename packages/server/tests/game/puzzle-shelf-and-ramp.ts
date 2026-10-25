import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import type { GutenGuessBook } from '~~/data';
import {
  countContradictions,
  getDailyShelf,
  getNarrowedShelf,
  NARROWED_SHELF_SIZE,
  NEIGHBOUR_SHARE,
  SHELF_SIZE,
} from '../../src/application/queries/puzzle/puzzle-shelf';
import {
  HINT_PLAN,
  HINT_POOL,
  selectHintDefinitions,
} from '../../src/application/queries/puzzle/hint-pool';
import {
  dateToSeed,
  seededRandom,
} from '../../src/domain/services/PuzzleService';

const ERAS = [
  'Victorian',
  'Romantic',
  'Regency',
  'Modernist',
  'Gilded Age',
  'Edwardian',
];
const GENRES = [
  'Romance',
  'Gothic',
  'Satire',
  'Adventure',
  'Mystery',
  'Poetry',
  'Tragedy',
];
const NATIONS = ['British', 'French', 'American', 'Russian'];
const WORDS = ['Night', 'Sea', 'House', 'Rose', 'Tide'];

const catalogue = Array.from(
  { length: 124 },
  (_, i) =>
    ({
      id: i + 1,
      title: {
        en: `${WORDS[i % 5]} ${'of '.repeat(i % 3)}Book ${i + 1}`.trim(),
      },
      author: `Author ${i + 1}`,
      era: ERAS[i % ERAS.length],
      genre: GENRES[i % GENRES.length],
      authorNationality: NATIONS[i % NATIONS.length],
      publicationYear: 1700 + ((i * 37) % 230),
    }) as unknown as GutenGuessBook,
);

const dates = Array.from({ length: 60 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 0, 1 + i));

  return d.toISOString().slice(0, 10);
});

const ids = (books: GutenGuessBook[]) => books.map((b) => b.id);

describe('daily shelf', () => {
  it('holds SHELF_SIZE unique books including the answer', () => {
    const answer = catalogue[99];
    const shelf = getDailyShelf(catalogue, answer, '2026-03-14');

    expect(shelf).toHaveLength(SHELF_SIZE);
    expect(new Set(ids(shelf)).size).toBe(SHELF_SIZE);
    expect(ids(shelf)).toContain(answer.id);
  });

  it('is deterministic for a date', () => {
    const answer = catalogue[7];

    expect(ids(getDailyShelf(catalogue, answer, '2026-03-14'))).toEqual(
      ids(getDailyShelf(catalogue, answer, '2026-03-14')),
    );
  });

  it('draws fresh decoys each day so the answer is not the one stranger', () => {
    const answer = catalogue[120];
    const seen = new Set<number>();
    let shared = 0;
    let previous: Set<number> | null = null;

    for (const date of dates) {
      const shelf = new Set(ids(getDailyShelf(catalogue, answer, date)));

      for (const id of shelf) {
        seen.add(id);
      }

      if (previous) {
        shared += [...shelf].filter((id) => previous!.has(id)).length;
      }
      previous = shelf;
    }

    // The whole catalogue shows up across two months of shelves
    expect(seen.size).toBeGreaterThan(110);
    // Consecutive shelves overlap like random draws (~20 of 50), not ~49
    expect(shared / (dates.length - 1)).toBeLessThan(30);
  });

  it('keeps the whole catalogue when it is smaller than a shelf', () => {
    const small = catalogue.slice(0, 3);
    const shelf = getDailyShelf(small, small[2], '2026-03-14');

    expect(ids(shelf).sort()).toEqual([1, 2, 3]);
  });
});

describe('daily shelf neighbours', () => {
  it('draws about a third of the decoys from the answer era or genre', () => {
    for (const date of dates.slice(0, 10)) {
      const answer = catalogue[dates.indexOf(date) * 7];
      const decoys = getDailyShelf(catalogue, answer, date).filter(
        (b) => b.id !== answer.id,
      );
      const neighbours = decoys.filter(
        (b) => b.era === answer.era || b.genre === answer.genre,
      ).length;

      // At least the planned share; random picks can add a few more
      expect(neighbours).toBeGreaterThanOrEqual(
        Math.round((SHELF_SIZE - 1) * NEIGHBOUR_SHARE),
      );
      expect(neighbours).toBeLessThan(SHELF_SIZE - 1);
    }
  });
});

describe('narrowed shelf', () => {
  it('is a subset of the day shelf that keeps the answer', () => {
    for (const date of dates) {
      const answer = catalogue[dates.indexOf(date)];
      const shelf = new Set(ids(getDailyShelf(catalogue, answer, date)));
      const narrowed = getNarrowedShelf(catalogue, answer, date);

      expect(narrowed).toHaveLength(NARROWED_SHELF_SIZE);
      expect(ids(narrowed)).toContain(answer.id);
      expect(ids(narrowed).every((id) => shelf.has(id))).toBeTruthy();
    }
  });
});

describe('narrowed shelf with the game state', () => {
  const date = '2026-04-02';
  const answer = catalogue[40];
  const shelf = getDailyShelf(catalogue, answer, date);
  const decoys = shelf.filter((b) => b.id !== answer.id);

  it('drops books already guessed', () => {
    const guessedIds = decoys.slice(0, 4).map((b) => b.id.toString());
    const narrowed = getNarrowedShelf(catalogue, answer, date, { guessedIds });

    expect(narrowed).toHaveLength(NARROWED_SHELF_SIZE);
    expect(
      narrowed.some((b) => guessedIds.includes(b.id.toString())),
    ).toBeFalsy();
    expect(ids(narrowed)).toContain(answer.id);
  });

  it('removes the decoys the open clues rule out first', () => {
    const openHintTypes = ['genre', 'author_nationality'] as const;
    const narrowed = getNarrowedShelf(catalogue, answer, date, {
      openHintTypes: [...openHintTypes],
    });
    const kept = new Set(ids(narrowed));
    const misses = (b: GutenGuessBook) =>
      countContradictions(b, answer, [...openHintTypes]);
    const keptWorst = Math.max(
      ...decoys.filter((b) => kept.has(b.id)).map(misses),
    );
    const droppedBest = Math.min(
      ...decoys.filter((b) => !kept.has(b.id)).map(misses),
    );

    expect(keptWorst).toBeLessThanOrEqual(droppedBest);
    expect(
      ids(narrowed).every((id) => shelf.some((b) => b.id === id)),
    ).toBeTruthy();
    expect(ids(narrowed)).toContain(answer.id);
  });

  it('is deterministic for a day and state', () => {
    const state = {
      guessedIds: [decoys[0].id.toString()],
      openHintTypes: ['era' as const],
    };

    expect(ids(getNarrowedShelf(catalogue, answer, date, state))).toEqual(
      ids(getNarrowedShelf(catalogue, answer, date, state)),
    );
  });

  it('checks first letter and word count against the localized title', () => {
    const sameStart = catalogue.find(
      (b) => b.id !== answer.id && b.title.en[0] === answer.title.en[0],
    )!;

    expect(countContradictions(sameStart, answer, ['first_letter'])).toBe(0);
    expect(
      countContradictions(answer, answer, [
        'title_word_count',
        'era',
        'publication_century',
      ]),
    ).toBe(0);
    // Clue types narrowing cannot check never count
    expect(countContradictions(sameStart, answer, ['quote', 'setting'])).toBe(
      0,
    );
  });
});

describe('clue ramp', () => {
  const tierOrder = HINT_PLAN.flatMap(([tier, count]) =>
    Array.from({ length: count }, () => tier),
  );

  it('every tier in the plan has enough clues to draw from', () => {
    for (const [tier, count] of HINT_PLAN) {
      expect(HINT_POOL.filter((h) => h.tier === tier).length).toBeGreaterThan(
        count,
      );
    }
  });

  it('ratings never overlap across tiers', () => {
    const range = (tier: string) =>
      HINT_POOL.filter((h) => h.tier === tier).map((h) => h.difficulty);

    expect(Math.max(...range('soft'))).toBeLessThan(
      Math.min(...range('medium')),
    );
    expect(Math.max(...range('medium'))).toBeLessThan(
      Math.min(...range('sharp')),
    );
  });

  it('climbs soft → medium → sharp every day, with no era/century pair', () => {
    for (let day = 0; day < 365; day++) {
      const date = new Date(Date.UTC(2026, 0, 1 + day))
        .toISOString()
        .slice(0, 10);
      const picked = selectHintDefinitions(seededRandom(dateToSeed(date)));
      const types = picked.map((h) => h.type);

      expect(picked.map((h) => h.tier)).toEqual(tierOrder);
      expect(new Set(types).size).toBe(types.length);
      expect(
        types.includes('era') && types.includes('publication_century'),
      ).toBeFalsy();
    }
  });

  it('puts the sharpest clue on the last try', () => {
    const date = '2026-05-05';
    const picked = selectHintDefinitions(seededRandom(dateToSeed(date)));

    expect(picked.at(-1)?.tier).toBe('sharp');
    expect(picked[0].tier).toBe('soft');
  });
});
