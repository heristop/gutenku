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
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import {
  createDailyHaikuRouter,
  type FetchDailyHaiku,
  type FetchDailyHaikuPage,
} from '~/presentation/rest/daily-haiku-router';
import type { DailyHaikuRecordWithNeighbours } from '~/application/queries/daily-haiku/GetDailyHaikuQuery';

const NOW = new Date('2026-10-23T12:00:00.000Z');
const TOKEN = 'a'.repeat(64);

function makeRecord(withCard = false): DailyHaikuRecordWithNeighbours {
  return {
    date: '2026-10-23',
    publishedAt: new Date('2026-10-23T10:02:00.000Z'),
    verses: ['old pond', 'a frog jumps in', 'sound of water'],
    title: 'Gilded Joy',
    description: 'A reading.',
    book: { title: 'Walden', author: 'Henry David Thoreau' },
    source: 'cli',
    hasCard: true,
    previousDate: null,
    nextDate: null,
    ...(withCard
      ? {
          card: {
            contentType: 'image/jpeg' as const,
            data: Buffer.from('ffd8ffe0', 'hex'),
          },
        }
      : {}),
  };
}

describe('daily haiku REST API token', () => {
  let server: Server;
  let baseUrl: string;
  const fetchDailyHaiku = vi.fn<FetchDailyHaiku>();
  const fetchDailyHaikuPage = vi.fn<FetchDailyHaikuPage>();

  beforeAll(async () => {
    const app = express();
    app.use(
      '/api/daily-haiku',
      createDailyHaikuRouter({
        fetchDailyHaiku,
        fetchDailyHaikuPage,
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
    fetchDailyHaiku.mockResolvedValue(makeRecord());
    fetchDailyHaikuPage.mockReset();
    fetchDailyHaikuPage.mockResolvedValue({
      records: [makeRecord()],
      hasMore: false,
      following: null,
    });
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DAILY_HAIKU_API_TOKENS', `other-token, ${TOKEN}`);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const call = (path: string, token?: string) =>
    fetch(`${baseUrl}/api/daily-haiku${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

  it.each(['', '/history'])('serves %s with a valid token', async (path) => {
    const res = await call(path, TOKEN);

    expect(res.status).toBe(200);
    expect(res.headers.get('vary')).toContain('Authorization');
  });

  it.each([
    ['no header', undefined],
    ['a wrong token', 'b'.repeat(64)],
    ['a token of another length', 'short'],
  ])('refuses %s with a JSON 401', async (_case, token) => {
    const res = await call('/history', token);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(
      expect.objectContaining({ error: 'unauthorized' }),
    );
    expect(fetchDailyHaikuPage).not.toHaveBeenCalled();
  });

  it('refuses everything in production when no token is configured', async () => {
    vi.stubEnv('DAILY_HAIKU_API_TOKENS', '');

    const res = await call('', TOKEN);

    expect(res.status).toBe(401);
    expect(fetchDailyHaiku).not.toHaveBeenCalled();
  });

  it('stays open in development when no token is configured', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DAILY_HAIKU_API_TOKENS', '');

    expect((await call('')).status).toBe(200);
  });

  it('serves the card without a token, for <img> tags', async () => {
    fetchDailyHaiku.mockResolvedValue(makeRecord(true));

    const res = await call('/card.jpg?d=2026-10-23');

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/jpeg');
  });
});
