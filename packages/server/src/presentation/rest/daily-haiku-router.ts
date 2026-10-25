import cors from 'cors';
import {
  Router,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';
import { container } from 'tsyringe';
import { type IQueryBus, IQueryBusToken } from '~/application/cqrs';
import {
  DAILY_HAIKU_PAGE_DEFAULT,
  DAILY_HAIKU_PAGE_MAX,
} from '@gutenku/shared';
import {
  GetDailyHaikuQuery,
  type DailyHaikuRecordWithNeighbours,
} from '~/application/queries/daily-haiku/GetDailyHaikuQuery';
import {
  GetDailyHaikuPageQuery,
  type DailyHaikuRecordPage,
} from '~/application/queries/daily-haiku/GetDailyHaikuPageQuery';
import type { DailyHaikuRecord } from '~/domain/repositories/IDailyHaikuRepository';
import {
  getCurrentPublicationDate,
  isValidDailyHaikuDate,
  secondsUntilNextRollover,
} from '~/domain/services/DailyHaikuSchedule';
import { createLogger } from '~/infrastructure/services/Logger';
import {
  cardEtag,
  resolvePublicBaseUrl,
  toPublicDailyHaiku,
  toPublicDailyHaikuPage,
} from './daily-haiku-presenter';

const log = createLogger('daily-haiku-api');

const DEFAULT_ALLOWED_ORIGINS = [
  'https://heristop.github.io',
  'https://gutenku.xyz',
];
const LOCALHOST_ORIGIN = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

// Short TTL while today's publication is late (so it shows up quickly).
const LATE_PUBLICATION_MAX_AGE = 300;
const NOT_FOUND_MAX_AGE = 60;
const ONE_YEAR = 31_536_000;
// Past archive pages only change when a missing day is backfilled.
const PAST_PAGE_CACHE_CONTROL =
  'public, max-age=3600, stale-while-revalidate=86400';
const LIMIT_PATTERN = /^\d+$/;

export type FetchDailyHaiku = (
  date: string | undefined,
  withCard: boolean,
  withNeighbours: boolean,
) => Promise<DailyHaikuRecordWithNeighbours | null>;

export type FetchDailyHaikuPage = (
  before: string | undefined,
  limit: number,
) => Promise<DailyHaikuRecordPage>;

export interface DailyHaikuRouterOptions {
  fetchDailyHaiku?: FetchDailyHaiku;
  fetchDailyHaikuPage?: FetchDailyHaikuPage;
  limiter?: RequestHandler;
  now?: () => Date;
}

function splitOrigins(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Public read-only origins: heristop.github.io, gutenku.xyz, any localhost
 * port, plus CORS_WHITELIST and DAILY_HAIKU_CORS_ORIGINS entries.
 */
export function isAllowedDailyHaikuOrigin(origin: string): boolean {
  if (LOCALHOST_ORIGIN.test(origin)) {
    return true;
  }

  const allowed = new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...splitOrigins(process.env.CORS_WHITELIST),
    ...splitOrigins(process.env.DAILY_HAIKU_CORS_ORIGINS),
  ]);

  return allowed.has(origin);
}

const dailyHaikuCors = cors({
  origin: (origin, callback) => {
    callback(null, origin ? isAllowedDailyHaikuOrigin(origin) : false);
  },
  methods: ['GET', 'HEAD'],
  maxAge: 86_400,
});

const defaultFetchDailyHaiku: FetchDailyHaiku = (
  date,
  withCard,
  withNeighbours,
) => {
  const queryBus = container.resolve<IQueryBus>(IQueryBusToken);

  return queryBus.execute(
    new GetDailyHaikuQuery(date, withCard, withNeighbours),
  );
};

const defaultFetchDailyHaikuPage: FetchDailyHaikuPage = (before, limit) => {
  const queryBus = container.resolve<IQueryBus>(IQueryBusToken);

  return queryBus.execute(new GetDailyHaikuPageQuery(before, limit));
};

/** Parses `limit`: defaults to 14, clamped to 30, null when invalid. */
export function parseDailyHaikuLimit(value: string | undefined): number | null {
  if (value === undefined) {
    return DAILY_HAIKU_PAGE_DEFAULT;
  }

  if (!LIMIT_PATTERN.test(value)) {
    return null;
  }

  const limit = Number.parseInt(value, 10);

  return limit >= 1 ? Math.min(limit, DAILY_HAIKU_PAGE_MAX) : null;
}

/** Cache lifetime for the "latest" resources, bounded by the next rollover. */
export function latestMaxAge(record: DailyHaikuRecord, now: Date): number {
  if (record.date < getCurrentPublicationDate(now)) {
    return Math.min(LATE_PUBLICATION_MAX_AGE, secondsUntilNextRollover(now));
  }

  return secondsUntilNextRollover(now);
}

function readQueryParam(req: Request, name: string): string | undefined {
  const value = (req.query as Record<string, unknown>)[name];

  return typeof value === 'string' && value !== '' ? value : undefined;
}

function sendError(
  res: Response,
  status: number,
  error: string,
  message: string,
) {
  res
    .status(status)
    .set(
      'Cache-Control',
      status === 404 ? `public, max-age=${NOT_FOUND_MAX_AGE}` : 'no-store',
    )
    .json({ error, message });
}

export function createDailyHaikuRouter(
  options: DailyHaikuRouterOptions = {},
): Router {
  const fetchDailyHaiku = options.fetchDailyHaiku ?? defaultFetchDailyHaiku;
  const fetchDailyHaikuPage =
    options.fetchDailyHaikuPage ?? defaultFetchDailyHaikuPage;
  const now = options.now ?? (() => new Date());
  const router = Router();

  router.use(dailyHaikuCors);

  if (options.limiter) {
    router.use(options.limiter);
  }

  async function load(
    req: Request,
    res: Response,
    param: string,
    withCard: boolean,
  ): Promise<{ record: DailyHaikuRecordWithNeighbours; date?: string } | null> {
    const date = readQueryParam(req, param);

    if (date !== undefined && !isValidDailyHaikuDate(date)) {
      sendError(res, 400, 'invalid_date', `"${param}" must be YYYY-MM-DD`);

      return null;
    }

    if (date !== undefined && date > getCurrentPublicationDate(now())) {
      sendError(res, 400, 'future_date', `"${param}" is not published yet`);

      return null;
    }

    try {
      const record = await fetchDailyHaiku(date, withCard, !withCard);

      if (!record || (withCard && !record.card)) {
        sendError(res, 404, 'not_found', 'No daily haiku published');

        return null;
      }

      return { record, date };
    } catch (err) {
      log.error({ err }, 'Failed to load daily haiku');
      sendError(
        res,
        503,
        'unavailable',
        'Daily haiku is temporarily unavailable',
      );

      return null;
    }
  }

  router.get('/', async (req, res) => {
    const loaded = await load(req, res, 'date', false);

    if (!loaded) {
      return;
    }

    const current = now();
    const maxAge = loaded.date
      ? secondsUntilNextRollover(current)
      : latestMaxAge(loaded.record, current);

    res
      .set('Cache-Control', `public, max-age=${maxAge}`)
      .json(
        toPublicDailyHaiku(loaded.record, resolvePublicBaseUrl(req), current),
      );
  });

  router.get('/history', async (req, res) => {
    const before = readQueryParam(req, 'before');
    const limit = parseDailyHaikuLimit(readQueryParam(req, 'limit'));

    if (before !== undefined && !isValidDailyHaikuDate(before)) {
      sendError(res, 400, 'invalid_date', '"before" must be YYYY-MM-DD');

      return;
    }

    if (limit === null) {
      sendError(
        res,
        400,
        'invalid_limit',
        '"limit" must be a positive integer',
      );

      return;
    }

    let page: DailyHaikuRecordPage;

    try {
      page = await fetchDailyHaikuPage(before, limit);
    } catch (err) {
      log.error({ err }, 'Failed to load daily haiku history');
      sendError(
        res,
        503,
        'unavailable',
        'Daily haiku history is temporarily unavailable',
      );

      return;
    }

    const current = now();
    const isFirstPage =
      before === undefined || before > getCurrentPublicationDate(current);
    const newest = page.records[0];
    let cacheControl = PAST_PAGE_CACHE_CONTROL;

    if (isFirstPage) {
      const maxAge = newest ? latestMaxAge(newest, current) : NOT_FOUND_MAX_AGE;
      cacheControl = `public, max-age=${maxAge}`;
    }

    res
      .set('Cache-Control', cacheControl)
      .json(toPublicDailyHaikuPage(page, resolvePublicBaseUrl(req), current));
  });

  router.get('/card.jpg', async (req, res) => {
    const loaded = await load(req, res, 'd', true);
    const card = loaded?.record.card;

    if (!loaded || !card) {
      return;
    }

    const { record, date } = loaded;
    const cacheControl = date
      ? `public, max-age=${ONE_YEAR}, immutable`
      : `public, max-age=${latestMaxAge(record, now())}`;

    res
      .set({
        'Content-Type': card.contentType,
        'Cache-Control': cacheControl,
        ETag: cardEtag(record.date, record.publishedAt),
        'Last-Modified': record.publishedAt.toUTCString(),
        // Allow <img> embedding from other origins (helmet defaults to same-origin).
        'Cross-Origin-Resource-Policy': 'cross-origin',
      })
      .send(card.data);
  });

  return router;
}
