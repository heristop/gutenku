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
} from '~/presentation/rest/daily-haiku-router';
import type { RenderDailyHaikuImage } from '~/presentation/rest/daily-haiku-image';
import { STATIC_THEMES } from '~/shared/themes/names';
import type { DailyHaikuRecordWithNeighbours } from '~/application/queries/daily-haiku/GetDailyHaikuQuery';

const NOW = new Date('2026-10-23T12:00:00.000Z');
const JPEG = Buffer.from('ffd8ffe0', 'hex');

function makeRecord(
  publishedAt = '2026-10-23T10:02:00.000Z',
): DailyHaikuRecordWithNeighbours {
  return {
    date: '2026-10-23',
    publishedAt: new Date(publishedAt),
    verses: ['old pond', 'a frog jumps in', 'sound of water'],
    title: 'Gilded Joy',
    description: 'A reading.',
    book: { title: 'Walden', author: 'Henry David Thoreau', reference: '205' },
    chapter: { title: 'Solitude' },
    source: 'cli',
    hasCard: true,
    previousDate: null,
    nextDate: null,
  };
}

describe('daily haiku REST API image', () => {
  let server: Server;
  let baseUrl: string;
  const fetchDailyHaiku = vi.fn<FetchDailyHaiku>();
  const renderDailyHaikuImage = vi.fn<RenderDailyHaikuImage>();

  beforeAll(async () => {
    const app = express();
    app.use(
      '/api/daily-haiku',
      createDailyHaikuRouter({
        fetchDailyHaiku,
        renderDailyHaikuImage,
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

  // Each test draws a day of its own, so the router's cache never crosses tests
  let publishedAt = Date.parse('2026-10-23T10:00:00.000Z');

  beforeEach(() => {
    publishedAt += 1000;
    fetchDailyHaiku.mockReset();
    fetchDailyHaiku.mockResolvedValue(
      makeRecord(new Date(publishedAt).toISOString()),
    );
    renderDailyHaikuImage.mockReset();
    renderDailyHaikuImage.mockResolvedValue(JPEG);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const draw = (query = '') =>
    fetch(`${baseUrl}/api/daily-haiku/image${query}`);

  it('returns the day with the haiku drawn in the asked theme', async () => {
    const res = await draw('?date=2026-10-23&theme=GreenTea');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(body).toEqual(
      expect.objectContaining({
        date: '2026-10-23',
        title: 'Gilded Joy',
        verses: ['old pond', 'a frog jumps in', 'sound of water'],
        reading: 'A reading.',
        theme: 'greentea',
        image: JPEG.toString('base64'),
      }),
    );
    expect(renderDailyHaikuImage).toHaveBeenCalledWith(
      expect.objectContaining({
        verses: ['old pond', 'a frog jumps in', 'sound of water'],
        title: 'Gilded Joy',
        chapter: { title: 'Solitude', content: '' },
        book: expect.objectContaining({ title: 'Walden', reference: '205' }),
      }),
      'greentea',
      false,
    );
  });

  it('paints AI themes with the image model', async () => {
    const res = await draw('?theme=sumie');

    expect(res.status).toBe(200);
    expect(renderDailyHaikuImage).toHaveBeenCalledWith(
      expect.anything(),
      'sumie',
      true,
    );
  });

  it('picks a drawn theme, never an AI one, by default', async () => {
    const body = await (await draw()).json();

    expect(STATIC_THEMES).toContain(body.theme);
    expect(renderDailyHaikuImage).toHaveBeenCalledWith(
      expect.anything(),
      body.theme,
      false,
    );
  });

  it('refuses an unknown theme before loading the day', async () => {
    const res = await draw('?theme=neon');

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid_theme');
    expect(fetchDailyHaiku).not.toHaveBeenCalled();
    expect(renderDailyHaikuImage).not.toHaveBeenCalled();
  });

  it('draws a day and theme once, even for simultaneous requests', async () => {
    const responses = await Promise.all([
      draw('?theme=ukiyoe'),
      draw('?theme=ukiyoe'),
    ]);
    await draw('?theme=ukiyoe');

    expect(responses.map((res) => res.status)).toEqual([200, 200]);
    expect(renderDailyHaikuImage).toHaveBeenCalledTimes(1);
  });

  it('answers 502 when drawing fails, and tries again next time', async () => {
    renderDailyHaikuImage.mockRejectedValueOnce(new Error('model down'));

    const failed = await draw('?theme=bookzen');
    const retried = await draw('?theme=bookzen');

    expect(failed.status).toBe(502);
    expect((await failed.json()).error).toBe('render_failed');
    expect(retried.status).toBe(200);
    expect(renderDailyHaikuImage).toHaveBeenCalledTimes(2);
  });

  it('needs the token in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DAILY_HAIKU_API_TOKENS', 'secret-token');

    expect((await draw('?theme=greentea')).status).toBe(401);
    expect(renderDailyHaikuImage).not.toHaveBeenCalled();
  });
});
