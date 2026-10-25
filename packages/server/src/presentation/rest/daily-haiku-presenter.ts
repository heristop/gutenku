import type { Request } from 'express';
import type { DailyHaiku, DailyHaikuPage } from '@gutenku/shared';
import type { DailyHaikuRecordWithNeighbours } from '~/application/queries/daily-haiku/GetDailyHaikuQuery';
import type { DailyHaikuRecordPage } from '~/application/queries/daily-haiku/GetDailyHaikuPageQuery';
import { getNextRolloverAt } from '~/domain/services/DailyHaikuSchedule';

export const DAILY_HAIKU_BASE_PATH = '/api/daily-haiku';
export const DAILY_HAIKU_CARD_PATH = `${DAILY_HAIKU_BASE_PATH}/card.jpg`;
export const DAILY_HAIKU_HISTORY_PATH = `${DAILY_HAIKU_BASE_PATH}/history`;

/**
 * Public origin used to build absolute URLs. PUBLIC_API_URL wins (set it in
 * production so URLs never depend on the request Host header); otherwise the
 * request protocol/host is used (honours `trust proxy`).
 */
export function resolvePublicBaseUrl(req?: Pick<Request, 'protocol' | 'get'>) {
  const configured = process.env.PUBLIC_API_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  const host = req?.get('host');

  if (!req || !host) {
    return '';
  }

  return `${req.protocol}://${host}`;
}

/** Card URL keyed by date and publication time, so a same-day re-publish busts immutable caches. */
export function buildCardUrl(
  baseUrl: string,
  date: string,
  publishedAt?: Date,
): string {
  const version = publishedAt ? `&v=${publishedAt.getTime()}` : '';

  return `${baseUrl}${DAILY_HAIKU_CARD_PATH}?d=${encodeURIComponent(date)}${version}`;
}

export function cardEtag(date: string, publishedAt: Date): string {
  return `"${date}-${publishedAt.getTime()}"`;
}

/**
 * Maps the stored record to the public contract: no ids, no source, no
 * chapter, no social caption, no card bytes. `previousDate`/`nextDate` are
 * only present when they were resolved.
 */
export function toPublicDailyHaiku(
  record: DailyHaikuRecordWithNeighbours,
  baseUrl: string,
  now: Date = new Date(),
): DailyHaiku {
  const dto: DailyHaiku = {
    date: record.date,
    publishedAt: record.publishedAt.toISOString(),
    title: record.title ?? null,
    verses: [...record.verses],
    reading: record.description ?? null,
    book: {
      title: record.book.title,
      author: record.book.author,
      emoticons: record.book.emoticons ?? null,
    },
    cardUrl: record.hasCard
      ? buildCardUrl(baseUrl, record.date, record.publishedAt)
      : null,
    nextRolloverAt: getNextRolloverAt(now).toISOString(),
  };

  if (record.previousDate !== undefined) {
    dto.previousDate = record.previousDate;
  }

  if (record.nextDate !== undefined) {
    dto.nextDate = record.nextDate;
  }

  return dto;
}

export function toPublicDailyHaikuPage(
  page: DailyHaikuRecordPage,
  baseUrl: string,
  now: Date = new Date(),
): DailyHaikuPage {
  return {
    items: page.records.map((record) =>
      toPublicDailyHaiku(record, baseUrl, now),
    ),
    nextBefore: page.nextBefore,
    hasMore: page.hasMore,
  };
}
