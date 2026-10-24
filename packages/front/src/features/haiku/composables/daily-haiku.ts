import {
  computed,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type Ref,
} from 'vue';
import { gql } from '@urql/vue';
import {
  getCurrentPublicationDate,
  getNextRolloverAt,
  type DailyHaiku,
  type HaikuValue,
} from '@gutenku/shared';
import { urqlClient } from '@/client';
import { useInkLoading } from '@/core/composables/ink-loading';
import { useHaikuStore } from '@/features/haiku/store/haiku';

/** One recorded day, whichever source answered. */
export interface DailyHaikuEntry {
  /** Publication day in UTC (YYYY-MM-DD). */
  date: string;
  title: string | null;
  verses: string[];
  reading: string | null;
  book: { title: string; author: string; emoticons: string | null };
  /** Absolute URL of the day's card, null when none was drawn. */
  cardUrl: string | null;
  /** ISO timestamp of the next daily rollover. */
  nextRolloverAt: string;
  /** Nearest earlier recorded day, null at the start of the archive. */
  previousDate: string | null;
  /** Nearest later recorded day, null on the latest one. */
  nextDate: string | null;
}

/** What the home slip shows: the entry plus whether it is today's page. */
export interface DailyHaikuSlipData extends DailyHaikuEntry {
  isToday: boolean;
}

type LegacyDailyHaiku = Pick<HaikuValue, 'verses'> & {
  book: Pick<HaikuValue['book'], 'title' | 'author'>;
};

// One recorded day: verses, reading, the book behind them and its neighbours
const DAILY_HAIKU_QUERY = gql`
  query DailyHaikuSlip($date: String) {
    dailyHaiku(date: $date) {
      date
      title
      verses
      reading
      book {
        title
        author
        emoticons
      }
      cardUrl
      nextRolloverAt
      previousDate
      nextDate
    }
  }
`;

// Fallback while today has no published daily haiku: text-only, no artwork
const DAILY_HAIKU_LINES_QUERY = gql`
  query DailyHaikuLines($date: String) {
    haiku(useCache: true, useDaily: true, date: $date) {
      book {
        title
        author
      }
      verses
    }
  }
`;

const MINUTE_MS = 60_000;
const RETRY_DELAYS_MS = [1500, 4000];
const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export interface NextHaikuCountdown {
  /** Whole hours left, or null under an hour. */
  hours: number | null;
  /** Minutes left when under an hour. */
  minutes: number;
  /** Share of the haiku's day already passed, 0 to 1. */
  progress: number;
  due: boolean;
}

export function countdownTo(rollover: Date, now: Date): NextHaikuCountdown {
  const left = rollover.getTime() - now.getTime();

  if (left <= 0) {
    return { hours: null, minutes: 0, progress: 1, due: true };
  }

  const hours = Math.floor(left / HOUR_MS);

  return {
    hours: hours >= 1 ? hours : null,
    minutes: Math.max(1, Math.ceil(left / MINUTE_MS)),
    progress: Math.min(1, Math.max(0, 1 - left / DAY_MS)),
    due: false,
  };
}

/** A day the archive answered for: its entry, or null when nothing was recorded. */
type CachedDay = DailyHaikuEntry | null;

// Per-session: days already read swap in instantly when the reader returns
const dayCache = new Map<string, CachedDay>();
const inflight = new Map<string, Promise<CachedDay>>();

/** Forget every cached day (tests, or a forced refresh). */
export function clearDailyHaikuCache(): void {
  dayCache.clear();
  inflight.clear();
}

function fromPublished(daily: DailyHaiku): DailyHaikuEntry {
  return {
    date: daily.date,
    title: daily.title?.trim() || null,
    verses: daily.verses,
    reading: daily.reading?.trim() || null,
    book: {
      title: daily.book.title,
      author: daily.book.author,
      emoticons: daily.book.emoticons?.trim() || null,
    },
    cardUrl: daily.cardUrl || null,
    nextRolloverAt: daily.nextRolloverAt,
    previousDate: daily.previousDate ?? null,
    nextDate: daily.nextDate ?? null,
  };
}

function fromLegacy(haiku: LegacyDailyHaiku, date: string): DailyHaikuEntry {
  return {
    date,
    title: null,
    verses: haiku.verses,
    reading: null,
    book: {
      title: haiku.book.title,
      author: haiku.book.author,
      emoticons: null,
    },
    cardUrl: null,
    nextRolloverAt: getNextRolloverAt(new Date()).toISOString(),
    previousDate: null,
    nextDate: null,
  };
}

async function fetchPublished(
  date: string | null,
): Promise<DailyHaikuEntry | null> {
  const result = await urqlClient
    .query<{ dailyHaiku: DailyHaiku | null }>(DAILY_HAIKU_QUERY, { date })
    .toPromise();

  if (result.error && !result.data?.dailyHaiku) {
    const futureDate = result.error.graphQLErrors?.some(
      (error) => error.message === 'future_date',
    );

    // A day that cannot exist yet is simply not recorded; anything else is a failure
    if (date && futureDate) {
      return null;
    }

    // A failed request is not "nothing published": never stand in another haiku
    throw result.error;
  }

  const daily = result.data?.dailyHaiku;

  return daily?.verses?.length ? fromPublished(daily) : null;
}

/**
 * The daily haiku for `day` (YYYY-MM-DD), or today's when `day` is null.
 * Past days come from the archive; only today falls back to the legacy daily.
 */
export function useDailyHaiku(day: Ref<string | null>) {
  const haikuStore = useHaikuStore();
  const entry = ref<DailyHaikuEntry | null>(null);
  const missing = ref(false);
  // The request failed (network, rate limit): say so, never show another haiku
  const failed = ref(false);
  const loading = ref(true);
  // No "now" on the server: the countdown lands after mount, then ticks each minute
  const now = ref<Date | null>(null);
  let timer: ReturnType<typeof setInterval> | undefined;
  let prefetchHandle: (() => void) | null = null;
  let reloadedFor = '';
  let requestId = 0;
  let mounted = false;

  useInkLoading(loading);

  async function fetchLegacy(today: string): Promise<DailyHaikuEntry | null> {
    const cached = haikuStore.cachedDailyHaiku;

    if (cached?.date === today && cached.haiku?.verses?.length) {
      return fromLegacy(cached.haiku, today);
    }

    const result = await urqlClient
      .query<{ haiku: LegacyDailyHaiku | null }>(DAILY_HAIKU_LINES_QUERY, {
        date: today,
      })
      .toPromise();

    return result.data?.haiku?.verses?.length
      ? fromLegacy(result.data.haiku, today)
      : null;
  }

  /** Fetch one day, sharing a request already on its way. */
  function fetchDay(date: string | null): Promise<CachedDay> {
    const key = date ?? getCurrentPublicationDate(new Date());
    const pending = inflight.get(key);

    if (pending) {
      return pending;
    }

    const request = (async (): Promise<CachedDay> => {
      if (date) {
        const published = await fetchPublished(date);
        dayCache.set(key, published);

        return published;
      }

      // Today: the published page; only when none is recorded yet, the legacy
      // daily lines (never cached under the archive so a late publication
      // still shows on the next visit). A failed request throws instead.
      const published = await fetchPublished(null);

      if (published) {
        // Cached under its own date: a late page never poses as today
        dayCache.set(published.date, published);

        return published;
      }

      return fetchLegacy(key);
    })().finally(() => {
      inflight.delete(key);
    });

    inflight.set(key, request);

    return request;
  }

  function cancelPrefetch(): void {
    prefetchHandle?.();
    prefetchHandle = null;
  }

  // The reader most often steps back a day: have it ready before they ask
  function schedulePrefetch(date: string | null): void {
    cancelPrefetch();

    if (!date || dayCache.has(date) || inflight.has(date)) {
      return;
    }

    const run = () => {
      prefetchHandle = null;
      fetchDay(date).catch(() => {});
    };

    if (typeof globalThis.requestIdleCallback === 'function') {
      const handle = globalThis.requestIdleCallback(run, { timeout: 2000 });
      prefetchHandle = () => globalThis.cancelIdleCallback(handle);

      return;
    }

    const handle = setTimeout(run, 200);
    prefetchHandle = () => clearTimeout(handle);
  }

  function settle(result: CachedDay): void {
    failed.value = false;
    entry.value = result;
    // Only a past day can be "not recorded"; an empty today is still being cut
    missing.value = result === null && day.value !== null;
    loading.value = false;
    schedulePrefetch(result?.previousDate ?? null);
  }

  async function load(): Promise<void> {
    const requested = day.value;
    const key = requested ?? getCurrentPublicationDate(new Date());
    const id = ++requestId;

    cancelPrefetch();

    if (dayCache.has(key)) {
      settle(dayCache.get(key) ?? null);

      return;
    }

    // Keep the current page on screen (dimmed) while the next one arrives
    loading.value = true;

    // A brief failure (a dropped connection, a rate limit) is retried twice
    // quietly before the slip admits it
    for (let attempt = 0; ; attempt++) {
      try {
        const result = await fetchDay(requested);

        if (id === requestId) {
          settle(result);
        }

        return;
      } catch {
        if (id !== requestId) {
          return;
        }

        if (attempt < RETRY_DELAYS_MS.length) {
          await new Promise<void>((resolve) => {
            setTimeout(resolve, RETRY_DELAYS_MS[attempt]);
          });

          if (id !== requestId) {
            return;
          }

          continue;
        }

        entry.value = null;
        missing.value = false;
        failed.value = true;
        loading.value = false;

        return;
      }
    }
  }

  const haiku = computed<DailyHaikuSlipData | null>(() => {
    if (!entry.value) {
      return null;
    }

    const today = getCurrentPublicationDate(now.value ?? new Date());

    // The current view is today's page even when the server stands in the
    // latest complete haiku while today's is not titled and read yet
    return {
      ...entry.value,
      isToday: entry.value.date === today || day.value === null,
    };
  });

  const isToday = computed(() => haiku.value?.isToday ?? day.value === null);

  const countdown = computed<NextHaikuCountdown | null>(() => {
    if (!now.value || !isToday.value) {
      return null;
    }

    const published = haiku.value?.nextRolloverAt
      ? new Date(haiku.value.nextRolloverAt)
      : null;
    const rollover =
      published && !Number.isNaN(published.getTime())
        ? published
        : getNextRolloverAt(now.value);

    return countdownTo(rollover, now.value);
  });

  function tick(): void {
    now.value = new Date();

    // Only today's page turns over: once the rollover passes, fetch it once
    const rolloverAt = entry.value?.nextRolloverAt ?? '';
    const rollover = rolloverAt ? new Date(rolloverAt).getTime() : Number.NaN;

    if (
      day.value === null &&
      rolloverAt &&
      reloadedFor !== rolloverAt &&
      now.value.getTime() >= rollover
    ) {
      reloadedFor = rolloverAt;
      // Yesterday's entry learns its new neighbour on the next read
      if (entry.value) {
        dayCache.delete(entry.value.date);
      }
      load();
    }
  }

  watch(day, () => {
    if (mounted) {
      load();
    }
  });

  if (getCurrentInstance()) {
    onMounted(() => {
      mounted = true;
      now.value = new Date();
      timer = setInterval(tick, MINUTE_MS);
      load();
    });

    onUnmounted(() => {
      mounted = false;
      clearInterval(timer);
      cancelPrefetch();
    });
  }

  return { haiku, missing, failed, loading, countdown, isToday, reload: load };
}
