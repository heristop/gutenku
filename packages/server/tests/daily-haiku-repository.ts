import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import DailyHaikuRepository, {
  DAILY_HAIKUS_COLLECTION,
} from '~/infrastructure/repositories/DailyHaikuRepository';
import type MongoConnection from '~/infrastructure/services/MongoConnection';
import type { DailyHaikuEntity } from '~/domain/repositories/IDailyHaikuRepository';

type Doc = Record<string, unknown> & { _id: number; date: string };
type Filter = Record<string, unknown>;

function getPath(doc: Record<string, unknown>, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === 'object'
          ? (value as Record<string, unknown>)[key]
          : undefined,
      doc,
    );
}

function matchesCondition(value: unknown, condition: unknown): boolean {
  if (condition === null || typeof condition !== 'object') {
    return value === condition;
  }

  return Object.entries(condition as Record<string, unknown>).every(
    ([op, operand]) => {
      switch (op) {
        case '$lt': {
          return value !== undefined && (value as string) < (operand as string);
        }
        case '$lte': {
          return (
            value !== undefined && (value as string) <= (operand as string)
          );
        }
        case '$gt': {
          return value !== undefined && (value as string) > (operand as string);
        }
        case '$exists': {
          return (value !== undefined) === operand;
        }
        case '$type': {
          return typeof value === operand;
        }
        case '$nin': {
          return !(operand as unknown[]).includes(value);
        }
        default: {
          throw new Error(`unsupported operator ${op}`);
        }
      }
    },
  );
}

function matches(doc: Doc, filter: Filter): boolean {
  return Object.entries(filter).every(([key, condition]) => {
    if (key === '$or') {
      return (condition as Filter[]).some((sub) => matches(doc, sub));
    }

    return matchesCondition(getPath(doc, key), condition);
  });
}

function project(doc: Doc, projection: Record<string, 0 | 1>) {
  const inclusive = Object.entries(projection).filter(
    ([key, v]) => v === 1 && key !== '_id',
  );

  if (inclusive.length > 0) {
    return Object.fromEntries(inclusive.map(([key]) => [key, doc[key]]));
  }

  const copy = structuredClone({ ...doc, card: undefined }) as Record<
    string,
    unknown
  >;
  copy.card = doc.card ? { ...(doc.card as object) } : undefined;

  if (copy.card === undefined) {
    delete copy.card;
  }

  for (const key of Object.keys(projection)) {
    const [head, tail] = key.split('.');

    if (tail && copy[head]) {
      delete (copy[head] as Record<string, unknown>)[tail];
    } else {
      delete copy[head];
    }
  }

  return copy;
}

function sortDocs(docs: Doc[], sort: { date: 1 | -1 }) {
  return docs.toSorted((a, b) => a.date.localeCompare(b.date) * sort.date);
}

// Stored buffers come back from the driver as BSON Binary.
function toStored(doc: Record<string, unknown>) {
  const card = doc.card as { contentType: string; data: Buffer } | undefined;

  return card
    ? { ...doc, card: { ...card, data: new mongoose.mongo.Binary(card.data) } }
    : { ...doc };
}

/** Minimal in-memory stand-in for the driver collection used by the repo. */
function createFakeCollection() {
  const docs: Doc[] = [];
  let nextId = 1;
  let raceOnNextUpsert: Record<string, unknown> | null = null;

  return {
    docs,
    /** Simulates another process inserting the same day concurrently. */
    raceOnNextUpsert(doc: Record<string, unknown>) {
      raceOnNextUpsert = doc;
    },
    createIndex: vi.fn(async () => 'date_unique'),
    updateOne: vi.fn(
      async (
        filter: { date: string },
        update: { $setOnInsert: Record<string, unknown> },
        options: { upsert?: boolean },
      ) => {
        if (raceOnNextUpsert) {
          docs.push({ _id: nextId++, ...(raceOnNextUpsert as Doc) });
          raceOnNextUpsert = null;
          throw Object.assign(new Error('E11000 duplicate key'), {
            code: 11000,
          });
        }

        const existing = docs.find((d) => d.date === filter.date);

        if (existing) {
          return { matchedCount: 1, upsertedCount: 0 };
        }

        if (!options.upsert) {
          return { matchedCount: 0, upsertedCount: 0 };
        }

        docs.push({
          _id: nextId++,
          ...(toStored(update.$setOnInsert) as Doc),
        });

        return { matchedCount: 0, upsertedCount: 1 };
      },
    ),
    replaceOne: vi.fn(async (filter: Filter, replacement: Doc) => {
      const index = docs.findIndex((d) => matches(d, filter));

      if (index === -1) {
        return { matchedCount: 0 };
      }

      docs[index] = { _id: docs[index]._id, ...(toStored(replacement) as Doc) };

      return { matchedCount: 1 };
    }),
    findOne: vi.fn(
      async (
        filter: Filter,
        options: {
          projection: Record<string, 0 | 1>;
          sort: { date: 1 | -1 };
        },
      ) => {
        const found = sortDocs(
          docs.filter((d) => matches(d, filter)),
          options.sort,
        )[0];

        return found ? project(found, options.projection) : null;
      },
    ),
    find: vi.fn(
      (
        filter: Filter,
        options: {
          projection: Record<string, 0 | 1>;
          sort: { date: 1 | -1 };
          limit: number;
        },
      ) => ({
        toArray: async () =>
          sortDocs(
            docs.filter((d) => matches(d, filter)),
            options.sort,
          )
            .slice(0, options.limit)
            .map((d) => project(d, options.projection)),
      }),
    ),
  };
}

function makeEntity(
  date: string,
  overrides: Partial<DailyHaikuEntity> = {},
): DailyHaikuEntity {
  return {
    date,
    publishedAt: new Date(`${date}T10:05:00.000Z`),
    verses: ['old pond', 'a frog jumps in', 'sound of water'],
    title: `Title ${date}`,
    description: `Reading ${date}`,
    book: { title: 'Walden', author: 'Henry David Thoreau', emoticons: '🌲🏞️' },
    card: { contentType: 'image/jpeg', data: Buffer.from(`jpeg-${date}`) },
    source: 'cli',
    ...overrides,
  };
}

function withoutCard(entity: DailyHaikuEntity): DailyHaikuEntity {
  const { card: _card, ...rest } = entity;

  return rest;
}

describe('DailyHaikuRepository', () => {
  let collection: ReturnType<typeof createFakeCollection>;
  let repository: DailyHaikuRepository;
  let collectionFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    collection = createFakeCollection();
    collectionFn = vi.fn(() => collection);
    const connection = {
      db: { collection: collectionFn },
    } as unknown as MongoConnection;
    repository = new DailyHaikuRepository(connection);
  });

  describe('insertIfAbsent', () => {
    it('inserts with $setOnInsert and a unique date index', async () => {
      expect(await repository.insertIfAbsent(makeEntity('2026-10-22'))).toBe(
        'inserted',
      );
      expect(await repository.insertIfAbsent(makeEntity('2026-10-23'))).toBe(
        'inserted',
      );

      expect(collectionFn).toHaveBeenCalledWith(DAILY_HAIKUS_COLLECTION);
      expect(collection.createIndex).toHaveBeenCalledTimes(1);
      expect(collection.createIndex).toHaveBeenCalledWith(
        { date: 1 },
        expect.objectContaining({ unique: true }),
      );
      expect(collection.updateOne).toHaveBeenCalledWith(
        { date: '2026-10-23' },
        {
          $setOnInsert: expect.objectContaining({ date: '2026-10-23' }),
        },
        { upsert: true },
      );
      expect(collection.docs).toHaveLength(2);
    });

    it('never overwrites an existing day', async () => {
      await repository.insertIfAbsent(makeEntity('2026-10-23'));

      expect(
        await repository.insertIfAbsent(
          makeEntity('2026-10-23', { title: 'Second run' }),
        ),
      ).toBe('exists');
      expect((await repository.findByDate('2026-10-23'))?.title).toBe(
        'Title 2026-10-23',
      );
    });

    it('treats a duplicate key race as an existing day', async () => {
      collection.raceOnNextUpsert({ ...makeEntity('2026-10-23'), title: 'X' });

      expect(await repository.insertIfAbsent(makeEntity('2026-10-23'))).toBe(
        'exists',
      );
      expect(collection.docs).toHaveLength(1);
    });

    it('rethrows other write errors', async () => {
      collection.updateOne.mockRejectedValueOnce(new Error('boom'));

      await expect(
        repository.insertIfAbsent(makeEntity('2026-10-23')),
      ).rejects.toThrow('boom');
    });
  });

  describe('publish', () => {
    it('inserts a missing day', async () => {
      expect(await repository.publish(makeEntity('2026-10-23'))).toBe(
        'inserted',
      );
    });

    it('replaces an auto record', async () => {
      await repository.insertIfAbsent(
        withoutCard(makeEntity('2026-10-23', { source: 'auto', title: 'A' })),
      );

      expect(await repository.publish(makeEntity('2026-10-23'))).toBe(
        'replaced',
      );

      const record = await repository.findByDate('2026-10-23');
      expect(record?.source).toBe('cli');
      expect(record?.title).toBe('Title 2026-10-23');
      expect(record?.hasCard).toBeTruthy();
    });

    it('replaces a legacy record without a card', async () => {
      const { source: _source, ...legacy } = withoutCard(
        makeEntity('2026-10-23'),
      );
      collection.docs.push({ _id: 99, ...legacy });

      expect(await repository.publish(makeEntity('2026-10-23'))).toBe(
        'replaced',
      );
    });

    it.each(['cli', 'seed', 'backfill'] as const)(
      'keeps a %s record unless forced',
      async (source) => {
        await repository.insertIfAbsent(
          makeEntity('2026-10-23', { source, title: 'Original' }),
        );

        expect(
          await repository.publish(makeEntity('2026-10-23', { title: 'New' })),
        ).toBe('kept');
        expect((await repository.findByDate('2026-10-23'))?.title).toBe(
          'Original',
        );

        expect(
          await repository.publish(makeEntity('2026-10-23', { title: 'New' }), {
            force: true,
          }),
        ).toBe('replaced');
        expect((await repository.findByDate('2026-10-23'))?.title).toBe('New');
      },
    );

    it('keeps a legacy record with a card', async () => {
      const { source: _source, ...legacy } = makeEntity('2026-10-23');
      collection.docs.push({ _id: 99, ...(toStored(legacy) as Doc) });

      expect(await repository.publish(makeEntity('2026-10-23'))).toBe('kept');
      expect((await repository.findByDate('2026-10-23'))?.source).toBe('cli');
    });
  });

  describe('reads', () => {
    it('findLatest returns the most recent date without the card bytes', async () => {
      await repository.insertIfAbsent(makeEntity('2026-10-21'));
      await repository.insertIfAbsent(makeEntity('2026-10-23'));
      await repository.insertIfAbsent(makeEntity('2026-10-22'));

      const latest = await repository.findLatest();

      expect(latest?.date).toBe('2026-10-23');
      expect(latest?.card).toBeUndefined();
      expect(latest?.hasCard).toBeTruthy();
      expect(latest).not.toHaveProperty('_id');
      expect(latest?.publishedAt).toBeInstanceOf(Date);
    });

    it('findLatest honours notAfter', async () => {
      await repository.insertIfAbsent(makeEntity('2026-10-22'));
      await repository.insertIfAbsent(makeEntity('2026-10-24'));

      expect(
        (await repository.findLatest({ notAfter: '2026-10-23' }))?.date,
      ).toBe('2026-10-22');
    });

    it('reports hasCard false for a card-less record', async () => {
      await repository.insertIfAbsent(
        withoutCard(makeEntity('2026-10-23', { source: 'auto' })),
      );

      const record = await repository.findByDate('2026-10-23');

      expect(record?.hasCard).toBeFalsy();
      expect(record?.source).toBe('auto');
    });

    it('defaults legacy records to the cli source', async () => {
      const { source: _source, ...legacy } = makeEntity('2026-10-23');
      collection.docs.push({ _id: 99, ...(toStored(legacy) as Doc) });

      expect((await repository.findByDate('2026-10-23'))?.source).toBe('cli');
    });

    it('returns the card as a Buffer when requested', async () => {
      await repository.insertIfAbsent(makeEntity('2026-10-23'));

      const latest = await repository.findLatest({ withCard: true });

      expect(Buffer.isBuffer(latest?.card?.data)).toBeTruthy();
      expect(latest?.card?.data.toString()).toBe('jpeg-2026-10-23');
      expect(latest?.card?.contentType).toBe('image/jpeg');
    });

    it('findByDate returns null for an unknown or capped day', async () => {
      await repository.insertIfAbsent(makeEntity('2026-10-23'));
      await repository.insertIfAbsent(makeEntity('2026-10-25'));

      expect(await repository.findByDate('2026-10-22')).toBeNull();
      expect((await repository.findByDate('2026-10-23'))?.verses).toHaveLength(
        3,
      );
      expect(
        await repository.findByDate('2026-10-25', { notAfter: '2026-10-24' }),
      ).toBeNull();
    });

    it('findLatest returns null when the collection is empty', async () => {
      expect(await repository.findLatest()).toBeNull();
    });
  });

  describe('findPage', () => {
    beforeEach(async () => {
      for (const date of [
        '2026-10-18',
        '2026-10-19',
        '2026-10-21',
        '2026-10-22',
        '2026-10-23',
        '2026-10-24',
      ]) {
        await repository.insertIfAbsent(makeEntity(date));
      }
    });

    it('skips days without a title or reading (automatic records)', async () => {
      await repository.insertIfAbsent(
        makeEntity('2026-10-25', {
          title: undefined,
          description: undefined,
          source: 'auto',
        }),
      );

      const page = await repository.findPage({
        notAfter: '2026-10-25',
        limit: 1,
      });
      const neighbours = await repository.findNeighbours(
        '2026-10-24',
        '2026-10-25',
      );

      expect(page.records.map((r) => r.date)).toEqual(['2026-10-24']);
      expect(neighbours.nextDate).toBeNull();
    });

    it('returns newest first, capped by notAfter, with hasMore', async () => {
      const page = await repository.findPage({
        notAfter: '2026-10-23',
        limit: 2,
      });

      expect(page.records.map((r) => r.date)).toEqual([
        '2026-10-23',
        '2026-10-22',
      ]);
      expect(page.hasMore).toBeTruthy();
      expect(page.following).toBe('2026-10-21');
      expect(collection.find).toHaveBeenCalledWith(
        {
          date: { $lte: '2026-10-23' },
          title: { $type: 'string', $nin: [''] },
          description: { $type: 'string', $nin: [''] },
        },
        expect.objectContaining({
          limit: 3,
          sort: { date: -1 },
          projection: { _id: 0, 'card.data': 0 },
        }),
      );
    });

    it('excludes card bytes but reports hasCard', async () => {
      const page = await repository.findPage({
        notAfter: '2026-10-23',
        limit: 1,
      });

      expect(page.records[0].card).toBeUndefined();
      expect(page.records[0].hasCard).toBeTruthy();
    });

    it('uses before as an exclusive cursor', async () => {
      const page = await repository.findPage({
        before: '2026-10-21',
        notAfter: '2026-10-23',
        limit: 5,
      });

      expect(page.records.map((r) => r.date)).toEqual([
        '2026-10-19',
        '2026-10-18',
      ]);
      expect(page.hasMore).toBeFalsy();
      expect(page.following).toBeNull();
    });
  });

  describe('findNeighbours', () => {
    beforeEach(async () => {
      for (const date of ['2026-10-19', '2026-10-21', '2026-10-24']) {
        await repository.insertIfAbsent(makeEntity(date));
      }
    });

    it('returns the nearest recorded days, skipping holes', async () => {
      expect(
        await repository.findNeighbours('2026-10-21', '2026-10-24'),
      ).toEqual({ previousDate: '2026-10-19', nextDate: '2026-10-24' });
    });

    it('never points to a day after notAfter', async () => {
      expect(
        await repository.findNeighbours('2026-10-21', '2026-10-23'),
      ).toEqual({ previousDate: '2026-10-19', nextDate: null });
    });

    it('returns nulls at both ends', async () => {
      expect(
        await repository.findNeighbours('2026-10-19', '2026-10-19'),
      ).toEqual({ previousDate: null, nextDate: null });
    });
  });

  it('degrades gracefully without a database connection', async () => {
    const offline = new DailyHaikuRepository({
      db: null,
    } as unknown as MongoConnection);

    expect(offline.isAvailable()).toBeFalsy();
    expect(await offline.findLatest()).toBeNull();
    expect(await offline.findByDate('2026-10-23')).toBeNull();
    expect(
      await offline.findPage({ notAfter: '2026-10-23', limit: 5 }),
    ).toEqual({ records: [], hasMore: false, following: null });
    expect(await offline.findNeighbours('2026-10-23', '2026-10-23')).toEqual({
      previousDate: null,
      nextDate: null,
    });
    await expect(
      offline.insertIfAbsent(makeEntity('2026-10-23')),
    ).rejects.toThrow(/not connected/);
  });
});
