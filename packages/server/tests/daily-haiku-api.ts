import 'reflect-metadata';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import express from 'express';
import helmet from 'helmet';
import type { AddressInfo } from 'node:net';
import { get, type Server } from 'node:http';
import {
  createDailyHaikuRouter,
  isAllowedDailyHaikuOrigin,
  parseDailyHaikuLimit,
  type FetchDailyHaiku,
  type FetchDailyHaikuPage,
} from '~/presentation/rest/daily-haiku-router';
import { toPublicDailyHaiku } from '~/presentation/rest/daily-haiku-presenter';
import type { DailyHaikuRecordWithNeighbours } from '~/application/queries/daily-haiku/GetDailyHaikuQuery';

const NOW = new Date('2026-10-23T12:00:00.000Z');
const SECONDS_TO_ROLLOVER = 22 * 3600;
const CARD = Buffer.from('ffd8ffe0010203', 'hex');

function makeRecord(
  date = '2026-10-23',
  withCard = false,
  hasCard = true,
): DailyHaikuRecordWithNeighbours {
  return {
    date,
    publishedAt: new Date(`${date}T10:02:00.000Z`),
    verses: [
      'the golden marvel',
      'longeth thy smiling for tears',
      'the spontaneous bark',
    ],
    title: 'Gilded Joy',
    description: 'A reading.',
    book: {
      title: 'Thus Spake Zarathustra',
      author: 'Friedrich Nietzsche',
      reference: '1998',
      emoticons: '📜🏔️',
    },
    socialCaption: 'caption',
    source: 'cli',
    chapterId: '68c701011a684efaf0205a60',
    hasCard,
    ...(withCard
      ? { card: { contentType: 'image/jpeg' as const, data: CARD } }
      : {}),
  };
}

describe('daily haiku REST API', () => {
  let server: Server;
  let baseUrl: string;
  const fetchDailyHaiku = vi.fn<FetchDailyHaiku>();
  const fetchDailyHaikuPage = vi.fn<FetchDailyHaikuPage>();
  const limiter = vi.fn((_req: unknown, _res: unknown, next: () => void) =>
    next(),
  );

  beforeAll(async () => {
    const app = express();
    app.use(helmet());
    app.use(
      '/api/daily-haiku',
      createDailyHaikuRouter({
        fetchDailyHaiku,
        fetchDailyHaikuPage,
        limiter,
        now: () => NOW,
      }),
    );
    server = app.listen(0);
    await new Promise((resolve) => {
      server.once('listening', resolve);
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  });

  beforeEach(() => {
    fetchDailyHaiku.mockReset();
    fetchDailyHaikuPage.mockReset();
    limiter.mockClear();
    delete process.env.PUBLIC_API_URL;
  });

  afterEach(() => {
    delete process.env.PUBLIC_API_URL;
    delete process.env.CORS_WHITELIST;
  });

  describe('GET /api/daily-haiku', () => {
    it('returns the public shape without internal fields', async () => {
      fetchDailyHaiku.mockResolvedValue({
        ...makeRecord(),
        previousDate: '2026-10-21',
        nextDate: null,
      });

      const res = await fetch(`${baseUrl}/api/daily-haiku`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(fetchDailyHaiku).toHaveBeenCalledWith(undefined, false, true);
      expect(body).toEqual({
        date: '2026-10-23',
        publishedAt: '2026-10-23T10:02:00.000Z',
        title: 'Gilded Joy',
        verses: [
          'the golden marvel',
          'longeth thy smiling for tears',
          'the spontaneous bark',
        ],
        reading: 'A reading.',
        book: {
          title: 'Thus Spake Zarathustra',
          author: 'Friedrich Nietzsche',
          emoticons: '📜🏔️',
        },
        cardUrl: `${baseUrl}/api/daily-haiku/card.jpg?d=2026-10-23&v=${new Date('2026-10-23T10:02:00.000Z').getTime()}`,
        nextRolloverAt: '2026-10-24T10:00:00.000Z',
        previousDate: '2026-10-21',
        nextDate: null,
      });
      expect(body).not.toHaveProperty('_id');
      expect(body).not.toHaveProperty('socialCaption');
      expect(body).not.toHaveProperty('source');
      expect(body).not.toHaveProperty('chapterId');
      expect(body).not.toHaveProperty('chapter');
      expect(body.book).not.toHaveProperty('reference');
      expect(limiter).toHaveBeenCalled();
    });

    it('uses PUBLIC_API_URL for the card URL when configured', async () => {
      process.env.PUBLIC_API_URL = 'https://api.gutenku.xyz/';
      fetchDailyHaiku.mockResolvedValue(makeRecord());

      const body = await (await fetch(`${baseUrl}/api/daily-haiku`)).json();

      expect(body.cardUrl).toBe(
        `https://api.gutenku.xyz/api/daily-haiku/card.jpg?d=2026-10-23&v=${new Date('2026-10-23T10:02:00.000Z').getTime()}`,
      );
    });

    it('caches the latest haiku until the next rollover', async () => {
      fetchDailyHaiku.mockResolvedValue(makeRecord());

      const res = await fetch(`${baseUrl}/api/daily-haiku`);

      expect(res.headers.get('cache-control')).toBe(
        `public, max-age=${SECONDS_TO_ROLLOVER}`,
      );
    });

    it('uses a short cache when today publication is late', async () => {
      fetchDailyHaiku.mockResolvedValue(makeRecord('2026-10-22'));

      const res = await fetch(`${baseUrl}/api/daily-haiku`);

      expect(res.headers.get('cache-control')).toBe('public, max-age=300');
    });

    it('looks up a specific date', async () => {
      fetchDailyHaiku.mockResolvedValue(makeRecord('2026-10-20'));

      const res = await fetch(`${baseUrl}/api/daily-haiku?date=2026-10-20`);

      expect(res.status).toBe(200);
      expect(fetchDailyHaiku).toHaveBeenCalledWith('2026-10-20', false, true);
    });

    it('returns a null cardUrl when the day has no card', async () => {
      fetchDailyHaiku.mockResolvedValue(makeRecord('2026-10-23', false, false));

      const body = await (await fetch(`${baseUrl}/api/daily-haiku`)).json();

      expect(body.cardUrl).toBeNull();
    });

    it('rejects dates after the current publication date', async () => {
      const res = await fetch(`${baseUrl}/api/daily-haiku?date=2026-10-24`);

      expect(res.status).toBe(400);
      expect(res.headers.get('cache-control')).toBe('no-store');
      expect((await res.json()).error).toBe('future_date');
      expect(fetchDailyHaiku).not.toHaveBeenCalled();
    });

    it('returns a 404 JSON when nothing is published', async () => {
      fetchDailyHaiku.mockResolvedValue(null);

      const res = await fetch(`${baseUrl}/api/daily-haiku`);

      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toMatch(/application\/json/);
      expect(await res.json()).toEqual({
        error: 'not_found',
        message: 'No daily haiku published',
      });
    });

    it('rejects malformed dates with a 400 without querying', async () => {
      const res = await fetch(`${baseUrl}/api/daily-haiku?date=2026-02-30`);

      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe('invalid_date');
      expect(fetchDailyHaiku).not.toHaveBeenCalled();
    });

    it('returns a 503 JSON when the store fails', async () => {
      fetchDailyHaiku.mockRejectedValue(new Error('db down'));

      const res = await fetch(`${baseUrl}/api/daily-haiku`);

      expect(res.status).toBe(503);
      expect((await res.json()).error).toBe('unavailable');
    });
  });

  describe('GET /api/daily-haiku/history', () => {
    function makePage(dates: string[], hasMore = false) {
      return {
        records: dates.map((date, index) => ({
          ...makeRecord(date, false, index !== 0),
          previousDate: dates[index + 1] ?? null,
          nextDate: dates[index - 1] ?? null,
        })),
        nextBefore: hasMore ? (dates.at(-1) ?? null) : null,
        hasMore,
      };
    }

    it('returns a public page, newest first', async () => {
      fetchDailyHaikuPage.mockResolvedValue(
        makePage(['2026-10-23', '2026-10-22'], true),
      );

      const res = await fetch(`${baseUrl}/api/daily-haiku/history?limit=2`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(fetchDailyHaikuPage).toHaveBeenCalledWith(undefined, 2);
      expect(body.hasMore).toBeTruthy();
      expect(body.nextBefore).toBe('2026-10-22');
      expect(body.items.map((i: { date: string }) => i.date)).toEqual([
        '2026-10-23',
        '2026-10-22',
      ]);
      expect(body.items[0].cardUrl).toBeNull();
      expect(body.items[1].cardUrl).toMatch(/card\.jpg\?d=2026-10-22/);
      expect(body.items[1]).toMatchObject({
        previousDate: null,
        nextDate: '2026-10-23',
      });
      expect(body.items[0]).not.toHaveProperty('socialCaption');
      expect(body.items[0]).not.toHaveProperty('source');
      expect(limiter).toHaveBeenCalled();
    });

    it('defaults to 14 items and clamps to 30', async () => {
      fetchDailyHaikuPage.mockResolvedValue(makePage([]));

      await fetch(`${baseUrl}/api/daily-haiku/history`);
      await fetch(`${baseUrl}/api/daily-haiku/history?limit=500`);

      expect(fetchDailyHaikuPage).toHaveBeenNthCalledWith(1, undefined, 14);
      expect(fetchDailyHaikuPage).toHaveBeenNthCalledWith(2, undefined, 30);
    });

    it.each(['0', '-1', 'abc', '2.5'])(
      'rejects limit=%s with invalid_limit',
      async (limit) => {
        const res = await fetch(
          `${baseUrl}/api/daily-haiku/history?limit=${limit}`,
        );

        expect(res.status).toBe(400);
        expect((await res.json()).error).toBe('invalid_limit');
        expect(fetchDailyHaikuPage).not.toHaveBeenCalled();
      },
    );

    it('rejects a malformed cursor with invalid_date', async () => {
      const res = await fetch(
        `${baseUrl}/api/daily-haiku/history?before=2026-13-01`,
      );

      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe('invalid_date');
    });

    it('caches the first page until the next rollover', async () => {
      fetchDailyHaikuPage.mockResolvedValue(makePage(['2026-10-23']));

      const res = await fetch(`${baseUrl}/api/daily-haiku/history`);

      expect(res.headers.get('cache-control')).toBe(
        `public, max-age=${SECONDS_TO_ROLLOVER}`,
      );
    });

    it('caches the first page briefly when today is missing', async () => {
      fetchDailyHaikuPage.mockResolvedValue(makePage(['2026-10-22']));

      const res = await fetch(`${baseUrl}/api/daily-haiku/history`);

      expect(res.headers.get('cache-control')).toBe('public, max-age=300');
    });

    it('caches past pages for an hour with stale-while-revalidate', async () => {
      fetchDailyHaikuPage.mockResolvedValue(makePage(['2026-10-20']));

      const res = await fetch(
        `${baseUrl}/api/daily-haiku/history?before=2026-10-21`,
      );

      expect(fetchDailyHaikuPage).toHaveBeenCalledWith('2026-10-21', 14);
      expect(res.headers.get('cache-control')).toBe(
        'public, max-age=3600, stale-while-revalidate=86400',
      );
    });

    it('sends CORS headers for allowed origins', async () => {
      fetchDailyHaikuPage.mockResolvedValue(makePage([]));

      const res = await fetch(`${baseUrl}/api/daily-haiku/history`, {
        headers: { Origin: 'https://heristop.github.io' },
      });

      expect(res.headers.get('access-control-allow-origin')).toBe(
        'https://heristop.github.io',
      );
    });

    it('returns a 503 JSON when the store fails', async () => {
      fetchDailyHaikuPage.mockRejectedValue(new Error('db down'));

      const res = await fetch(`${baseUrl}/api/daily-haiku/history`);

      expect(res.status).toBe(503);
      expect((await res.json()).error).toBe('unavailable');
    });
  });

  describe('CORS', () => {
    it.each([
      'https://heristop.github.io',
      'https://gutenku.xyz',
      'http://localhost:4444',
    ])('allows %s', async (origin) => {
      fetchDailyHaiku.mockResolvedValue(makeRecord());

      const res = await fetch(`${baseUrl}/api/daily-haiku`, {
        headers: { Origin: origin },
      });

      expect(res.headers.get('access-control-allow-origin')).toBe(origin);
    });

    it('does not allow unknown origins', async () => {
      fetchDailyHaiku.mockResolvedValue(makeRecord());

      const res = await fetch(`${baseUrl}/api/daily-haiku`, {
        headers: { Origin: 'https://evil.example' },
      });

      expect(res.headers.get('access-control-allow-origin')).toBeNull();
    });

    it('answers preflight requests for GET only', async () => {
      const res = await fetch(`${baseUrl}/api/daily-haiku`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://heristop.github.io',
          'Access-Control-Request-Method': 'GET',
        },
      });

      expect(res.status).toBe(204);
      expect(res.headers.get('access-control-allow-methods')).toBe('GET,HEAD');
    });

    it('also honours CORS_WHITELIST entries', () => {
      process.env.CORS_WHITELIST =
        'https://www.gutenku.xyz, capacitor://localhost';

      expect(isAllowedDailyHaikuOrigin('https://www.gutenku.xyz')).toBeTruthy();
      expect(isAllowedDailyHaikuOrigin('capacitor://localhost')).toBeTruthy();
      expect(
        isAllowedDailyHaikuOrigin('http://localhost.evil.example'),
      ).toBeFalsy();
    });
  });

  describe('GET /api/daily-haiku/card.jpg', () => {
    it('serves the jpeg with rollover caching and cross-origin CORP', async () => {
      fetchDailyHaiku.mockResolvedValue(makeRecord('2026-10-23', true));

      const res = await fetch(`${baseUrl}/api/daily-haiku/card.jpg`);

      expect(res.status).toBe(200);
      expect(fetchDailyHaiku).toHaveBeenCalledWith(undefined, true, false);
      expect(res.headers.get('content-type')).toBe('image/jpeg');
      expect(res.headers.get('etag')).toMatch(/^"2026-10-23-\d+"$/);
      expect(res.headers.get('cache-control')).toBe(
        `public, max-age=${SECONDS_TO_ROLLOVER}`,
      );
      expect(res.headers.get('cross-origin-resource-policy')).toBe(
        'cross-origin',
      );
      expect(Buffer.from(await res.arrayBuffer())).toEqual(CARD);
    });

    it('is immutable when the date is pinned with ?d=', async () => {
      fetchDailyHaiku.mockResolvedValue(makeRecord('2026-10-20', true));

      const res = await fetch(
        `${baseUrl}/api/daily-haiku/card.jpg?d=2026-10-20`,
      );

      expect(fetchDailyHaiku).toHaveBeenCalledWith('2026-10-20', true, false);
      expect(res.headers.get('cache-control')).toBe(
        'public, max-age=31536000, immutable',
      );
    });

    it('answers 304 when the ETag matches', async () => {
      fetchDailyHaiku.mockResolvedValue(makeRecord('2026-10-23', true));

      // node:http instead of fetch: undici adds `cache-control: no-cache`
      // to conditional requests, which disables freshness checks.
      const status = await new Promise<number | undefined>(
        (resolve, reject) => {
          get(
            `${baseUrl}/api/daily-haiku/card.jpg`,
            {
              headers: {
                'If-None-Match': `"2026-10-23-${new Date('2026-10-23T10:02:00.000Z').getTime()}"`,
              },
            },
            (res) => {
              res.resume();
              resolve(res.statusCode);
            },
          ).on('error', reject);
        },
      );

      expect(status).toBe(304);
    });

    it('returns 404 JSON when no card exists', async () => {
      fetchDailyHaiku.mockResolvedValue(makeRecord('2026-10-23', false));

      const res = await fetch(`${baseUrl}/api/daily-haiku/card.jpg`);

      expect(res.status).toBe(404);
      expect((await res.json()).error).toBe('not_found');
    });

    it('keeps the helmet same-origin CORP on the JSON route', async () => {
      fetchDailyHaiku.mockResolvedValue(makeRecord());

      const res = await fetch(`${baseUrl}/api/daily-haiku`);

      expect(res.headers.get('cross-origin-resource-policy')).toBe(
        'same-origin',
      );
    });
  });
});

describe('parseDailyHaikuLimit', () => {
  it.each([
    [undefined, 14],
    ['1', 1],
    ['30', 30],
    ['31', 30],
    ['0', null],
    ['x', null],
  ])('%s -> %s', (value, expected) => {
    expect(parseDailyHaikuLimit(value)).toBe(expected);
  });
});

describe('toPublicDailyHaiku', () => {
  it('nulls optional fields and builds a relative card URL without a base', () => {
    const record = makeRecord();
    delete record.title;
    delete record.description;
    delete record.book.emoticons;

    const dto = toPublicDailyHaiku(
      record,
      '',
      new Date('2026-10-23T09:00:00.000Z'),
    );

    expect(dto.title).toBeNull();
    expect(dto.reading).toBeNull();
    expect(dto.book.emoticons).toBeNull();
    expect(dto.cardUrl).toBe(
      `/api/daily-haiku/card.jpg?d=2026-10-23&v=${new Date('2026-10-23T10:02:00.000Z').getTime()}`,
    );
    expect(dto.nextRolloverAt).toBe('2026-10-23T10:00:00.000Z');
  });
});
