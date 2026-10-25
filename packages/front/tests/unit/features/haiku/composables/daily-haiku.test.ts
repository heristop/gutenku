import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, nextTick, ref, type Ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

const query = vi.fn();

vi.mock('@/client', () => ({
  urqlClient: { query: (...args: unknown[]) => query(...args) },
}));

vi.mock('@/core/components/icons/ink', () => ({ Leaf: {} }));

const { clearDailyHaikuCache, countdownTo, useDailyHaiku } =
  await import('@/features/haiku/composables/daily-haiku');
const { useHaikuStore } = await import('@/features/haiku/store/haiku');

const TODAY = '2026-10-24';

function entry(
  date: string,
  previousDate: string | null,
  nextDate: string | null,
) {
  return {
    date,
    publishedAt: `${date}T10:00:00.000Z`,
    title: `Title ${date}`,
    verses: ['one', 'two', 'three'],
    reading: null,
    book: { title: 'Book', author: 'Author', emoticons: null },
    cardUrl: null,
    nextRolloverAt: '2026-10-25T10:00:00.000Z',
    previousDate,
    nextDate,
  };
}

const archive: Record<string, ReturnType<typeof entry> | null> = {
  [TODAY]: entry(TODAY, '2026-10-23', null),
  '2026-10-23': entry('2026-10-23', '2026-10-22', TODAY),
  '2026-10-22': entry('2026-10-22', null, '2026-10-23'),
};

function respond(data: unknown) {
  return { toPromise: () => Promise.resolve({ data, error: undefined }) };
}

function dailyCalls(date?: string | null) {
  return query.mock.calls.filter(
    ([doc, vars]) =>
      String(
        (doc as { loc?: { source: { body: string } } }).loc?.source.body ?? '',
      ).includes('dailyHaiku(date') &&
      (date === undefined || (vars as { date: string | null }).date === date),
  );
}

function host(
  day: Ref<string | null>,
  options?: Parameters<typeof useDailyHaiku>[1],
) {
  let api!: ReturnType<typeof useDailyHaiku>;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useDailyHaiku(day, options);

        return () => h('div');
      },
    }),
  );

  return { wrapper, api };
}

describe('useDailyHaiku', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'Date',
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
      ],
    });
    vi.setSystemTime(new Date('2026-10-24T12:00:00Z'));
    setActivePinia(createPinia());
    clearDailyHaikuCache();
    query.mockReset();
    query.mockImplementation((_doc, vars: { date: string | null }) => {
      if (
        'date' in vars &&
        String(_doc.loc?.source.body).includes('dailyHaiku(date')
      ) {
        return respond({ dailyHaiku: archive[vars.date ?? TODAY] ?? null });
      }

      return respond({
        haiku: {
          verses: ['legacy a', 'legacy b', 'legacy c'],
          book: { title: 'Old', author: 'Writer' },
        },
      });
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads today's haiku and marks it as today with a countdown", async () => {
    const { api } = host(ref(null));
    await flushPromises();

    expect(api.haiku.value?.date).toBe(TODAY);
    expect(api.haiku.value?.isToday).toBeTruthy();
    expect(api.haiku.value?.previousDate).toBe('2026-10-23');
    expect(api.countdown.value).not.toBeNull();
    expect(api.loading.value).toBeFalsy();
  });

  it('keeps the current view as today when the server stands in the latest complete day', async () => {
    const standIn = archive[TODAY];
    archive[TODAY] = entry('2026-10-23', '2026-10-22', null);

    try {
      const { api } = host(ref(null));
      await flushPromises();

      expect(api.haiku.value?.date).toBe('2026-10-23');
      expect(api.haiku.value?.isToday).toBeTruthy();
      expect(api.countdown.value).not.toBeNull();
    } finally {
      archive[TODAY] = standIn;
    }
  });

  it('treats the publication date, not midnight, as today', async () => {
    vi.setSystemTime(new Date('2026-10-24T08:00:00Z'));
    host(ref(null));
    await flushPromises();

    // Before 10:00 UTC the legacy fallback asks for yesterday's publication
    const legacy = query.mock.calls.find(([doc]) =>
      String(doc.loc?.source.body).includes('DailyHaikuLines'),
    );
    expect(legacy).toBeUndefined();
    expect(dailyCalls(null)).toHaveLength(1);
  });

  it('follows the day ref and shows no countdown on past days', async () => {
    const day = ref<string | null>(null);
    const { api } = host(day);
    await flushPromises();

    day.value = '2026-10-23';
    await flushPromises();

    expect(api.haiku.value?.date).toBe('2026-10-23');
    expect(api.haiku.value?.isToday).toBeFalsy();
    expect(api.countdown.value).toBeNull();
  });

  it('prefetches the previous day after settling', async () => {
    host(ref(null));
    await flushPromises();
    expect(dailyCalls('2026-10-23')).toHaveLength(0);

    vi.advanceTimersByTime(250);
    await flushPromises();

    expect(dailyCalls('2026-10-23')).toHaveLength(1);
  });

  it('swaps a cached day in without refetching', async () => {
    const day = ref<string | null>(null);
    const { api } = host(day);
    await flushPromises();
    vi.advanceTimersByTime(250);
    await flushPromises();

    const before = query.mock.calls.length;
    day.value = '2026-10-23';
    await nextTick();

    expect(api.haiku.value?.date).toBe('2026-10-23');
    expect(api.loading.value).toBeFalsy();

    day.value = null;
    await nextTick();
    expect(api.haiku.value?.date).toBe(TODAY);
    expect(dailyCalls(null)).toHaveLength(1);
    expect(query.mock.calls.length).toBe(before);
  });

  it('keeps the old page while a new day loads', async () => {
    const day = ref<string | null>(null);
    const { api } = host(day);
    await flushPromises();

    day.value = '2026-10-22';
    await nextTick();

    expect(api.loading.value).toBeTruthy();
    expect(api.haiku.value?.date).toBe(TODAY);

    await flushPromises();
    expect(api.haiku.value?.date).toBe('2026-10-22');
  });

  it('falls back to the legacy daily only for today', async () => {
    archive[TODAY] = null;

    try {
      const { api } = host(ref(null));
      await flushPromises();

      expect(api.haiku.value?.verses[0]).toBe('legacy a');
      expect(api.haiku.value?.isToday).toBeTruthy();
      expect(api.missing.value).toBeFalsy();
    } finally {
      archive[TODAY] = entry(TODAY, '2026-10-23', null);
    }
  });

  it('never stands in another haiku when the request fails, and retries twice', async () => {
    query.mockImplementation((doc) => {
      if (String(doc.loc?.source.body).includes('dailyHaiku(date')) {
        return {
          toPromise: () =>
            Promise.resolve({
              data: undefined,
              error: { message: 'Too many requests', graphQLErrors: [] },
            }),
        };
      }

      return respond({
        haiku: {
          verses: ['legacy a', 'legacy b', 'legacy c'],
          book: { title: 'Old', author: 'Writer' },
        },
      });
    });

    const { api } = host(ref(null));
    await flushPromises();
    expect(api.failed.value).toBeFalsy();

    await vi.advanceTimersByTimeAsync(1500);
    await vi.advanceTimersByTimeAsync(4000);
    await flushPromises();

    expect(dailyCalls(null)).toHaveLength(3);
    expect(api.failed.value).toBeTruthy();
    expect(api.haiku.value).toBeNull();
    expect(
      query.mock.calls.some(([doc]) =>
        String(doc.loc?.source.body).includes('DailyHaikuLines'),
      ),
    ).toBeFalsy();
  });

  it('marks an unrecorded past day as missing, without the legacy fallback', async () => {
    const { api } = host(ref('2026-01-01'));
    await flushPromises();

    expect(api.haiku.value).toBeNull();
    expect(api.missing.value).toBeTruthy();
    expect(
      query.mock.calls.some(([doc]) =>
        String(doc.loc?.source.body).includes('DailyHaikuLines'),
      ),
    ).toBeFalsy();
  });

  it('reloads at the rollover while showing today', async () => {
    host(ref(null));
    await flushPromises();
    vi.advanceTimersByTime(250);
    await flushPromises();
    const before = dailyCalls(null).length;

    vi.setSystemTime(new Date('2026-10-25T10:01:00Z'));
    vi.advanceTimersByTime(60_000);
    await flushPromises();

    expect(dailyCalls(null).length).toBe(before + 1);
  });

  it('does not reload a past day at the rollover', async () => {
    host(ref('2026-10-23'));
    await flushPromises();
    vi.advanceTimersByTime(250);
    await flushPromises();
    const before = dailyCalls().length;

    vi.setSystemTime(new Date('2026-10-25T10:01:00Z'));
    vi.advanceTimersByTime(60_000);
    await flushPromises();

    expect(dailyCalls().length).toBe(before);
  });

  describe('the excerpt', () => {
    const asksExcerpt = (call: unknown[]) =>
      String(
        (call[0] as { loc?: { source: { body: string } } }).loc?.source.body,
      ).includes('excerpt');

    it('is only asked for when the entrance wants it, once', async () => {
      const { api } = host(ref(null), { withExcerpt: true });
      await flushPromises();
      // Past the idle prefetch of the day before
      vi.advanceTimersByTime(2500);
      await flushPromises();

      expect(api.haiku.value?.date).toBe(TODAY);
      const calls = dailyCalls();
      expect(calls.length).toBeGreaterThan(1);
      expect(asksExcerpt(calls[0])).toBeTruthy();
      // The prefetched day before never reads a chapter
      expect(calls.slice(1).some(asksExcerpt)).toBeFalsy();
    });

    it('is never asked for by default', async () => {
      host(ref(null));
      await flushPromises();

      expect(dailyCalls().some(asksExcerpt)).toBeFalsy();
    });

    it("doesn't cost the day on a server that doesn't know it", async () => {
      const answer = query.getMockImplementation()!;
      query.mockImplementation((doc, vars) =>
        String(doc.loc?.source.body).includes('excerpt')
          ? {
              toPromise: () =>
                Promise.resolve({
                  data: undefined,
                  error: {
                    graphQLErrors: [
                      {
                        message:
                          'Cannot query field "excerpt" on type "DailyHaiku".',
                      },
                    ],
                  },
                }),
            }
          : answer(doc, vars),
      );

      const { api } = host(ref(null), { withExcerpt: true });
      await flushPromises();

      expect(api.failed.value).toBeFalsy();
      expect(api.haiku.value?.verses).toEqual(['one', 'two', 'three']);
      expect(api.haiku.value?.excerpt).toBe(null);
    });
  });
  describe('countdownTo', () => {
    const now = new Date('2026-10-24T12:00:00Z');

    it('is due once the rollover has passed', () => {
      expect(countdownTo(new Date('2026-10-24T11:00:00Z'), now)).toEqual({
        hours: null,
        minutes: 0,
        progress: 1,
        due: true,
      });
      expect(countdownTo(now, now).due).toBeTruthy();
    });

    it('counts whole hours while an hour or more is left', () => {
      const result = countdownTo(new Date('2026-10-24T15:30:00Z'), now);

      expect(result.hours).toBe(3);
      expect(result.due).toBeFalsy();
      expect(result.progress).toBeGreaterThan(0);
      expect(result.progress).toBeLessThan(1);
    });

    it('counts minutes only, rounded up, under an hour', () => {
      const result = countdownTo(new Date('2026-10-24T12:00:30Z'), now);

      expect(result.hours).toBeNull();
      expect(result.minutes).toBe(1);
    });

    it('keeps progress at zero when more than a day is left', () => {
      const result = countdownTo(new Date('2026-10-26T12:00:00Z'), now);

      expect(result.progress).toBe(0);
    });
  });

  describe('reading the archive', () => {
    const answer = (data: unknown, error?: unknown) => ({
      toPromise: () => Promise.resolve({ data, error }),
    });

    function archiveAnswers(
      build: (vars: { date: string | null }) => ReturnType<typeof answer>,
    ) {
      const fallback = query.getMockImplementation()!;
      query.mockImplementation((doc, vars) =>
        String(doc.loc?.source.body).includes('dailyHaiku(date')
          ? build(vars)
          : fallback(doc, vars),
      );
    }

    it('trims blank titles, readings and emoticons to null and keeps the card', async () => {
      archiveAnswers(() =>
        answer({
          dailyHaiku: {
            ...entry(TODAY, null, null),
            title: '   ',
            reading: '  ',
            book: { title: 'Book', author: 'Author', emoticons: '  ' },
            cardUrl: 'https://cards.test/today.png',
            previousDate: undefined,
            nextDate: undefined,
          },
        }),
      );

      const { api } = host(ref(null));
      await flushPromises();

      expect(api.haiku.value?.title).toBeNull();
      expect(api.haiku.value?.reading).toBeNull();
      expect(api.haiku.value?.book.emoticons).toBeNull();
      expect(api.haiku.value?.cardUrl).toBe('https://cards.test/today.png');
      expect(api.haiku.value?.previousDate).toBeNull();
      expect(api.haiku.value?.nextDate).toBeNull();
    });

    it('keeps a real excerpt and drops one without verses', async () => {
      const excerpt = { text: 'In a chapter', verses: ['one'] };
      archiveAnswers((vars) =>
        answer({
          dailyHaiku: {
            ...entry(vars.date ?? TODAY, null, null),
            excerpt:
              vars.date === '2026-10-23' ? { text: 'x', verses: [] } : excerpt,
          },
        }),
      );

      const today = host(ref(null), { withExcerpt: true });
      const past = host(ref('2026-10-23'));
      await flushPromises();

      expect(today.api.haiku.value?.excerpt).toEqual(excerpt);
      expect(past.api.haiku.value?.excerpt).toBeNull();
    });

    it('treats a published day without verses as not recorded', async () => {
      archiveAnswers((vars) =>
        answer({
          dailyHaiku: { ...entry(vars.date ?? TODAY, null, null), verses: [] },
        }),
      );

      const { api } = host(ref('2026-10-23'));
      await flushPromises();

      expect(api.haiku.value).toBeNull();
      expect(api.missing.value).toBeTruthy();
    });

    it('treats a future date as not recorded, not as a failure', async () => {
      archiveAnswers(() =>
        answer(undefined, {
          message: '[GraphQL] future_date',
          graphQLErrors: [{ message: 'future_date' }],
        }),
      );

      const { api } = host(ref('2027-01-01'));
      await flushPromises();

      expect(api.failed.value).toBeFalsy();
      expect(api.missing.value).toBeTruthy();
      expect(dailyCalls('2027-01-01')).toHaveLength(1);
    });

    it('reads an error without graphQL errors as a failure', async () => {
      archiveAnswers(() => answer(undefined, { message: 'offline' }));

      const { api } = host(ref('2026-10-23'));
      await vi.advanceTimersByTimeAsync(6000);
      await flushPromises();

      expect(api.failed.value).toBeTruthy();
      expect(api.missing.value).toBeFalsy();
    });

    it("does not read a future_date on today's page as a recorded absence", async () => {
      archiveAnswers(() =>
        answer(undefined, {
          message: 'x',
          graphQLErrors: [{ message: 'future_date' }],
        }),
      );

      const { api } = host(ref(null));
      await vi.advanceTimersByTimeAsync(6000);
      await flushPromises();

      expect(api.failed.value).toBeTruthy();
    });

    it('treats an empty answer without error as nothing recorded', async () => {
      archiveAnswers(() => answer());

      const { api } = host(ref('2026-10-23'));
      await flushPromises();

      expect(api.missing.value).toBeTruthy();
      expect(api.failed.value).toBeFalsy();
    });
  });

  describe('the legacy daily', () => {
    function noPublishedToday(legacy: unknown) {
      query.mockImplementation((doc) =>
        String(doc.loc?.source.body).includes('dailyHaiku(date')
          ? respond({ dailyHaiku: null })
          : respond({ haiku: legacy }),
      );
    }

    it("reuses the store's cached daily for today without asking", async () => {
      noPublishedToday(null);
      useHaikuStore().cachedDailyHaiku = {
        date: TODAY,
        haiku: {
          verses: ['cached a', 'cached b', 'cached c'],
          book: { title: 'Cached', author: 'Stored' },
        },
      } as never;

      const { api } = host(ref(null));
      await flushPromises();

      expect(api.haiku.value?.verses[0]).toBe('cached a');
      expect(api.haiku.value?.book.title).toBe('Cached');
      expect(api.haiku.value?.cardUrl).toBeNull();
      expect(
        query.mock.calls.some(([doc]) =>
          String(doc.loc?.source.body).includes('DailyHaikuLines'),
        ),
      ).toBeFalsy();
    });

    it("asks for the lines when the store's cache is for another day", async () => {
      noPublishedToday({
        verses: ['legacy a', 'legacy b', 'legacy c'],
        book: { title: 'Old', author: 'Writer' },
      });
      useHaikuStore().cachedDailyHaiku = {
        date: '2026-10-01',
        haiku: { verses: ['stale'], book: { title: 'S', author: 'S' } },
      } as never;

      const { api } = host(ref(null));
      await flushPromises();

      expect(api.haiku.value?.verses[0]).toBe('legacy a');
    });

    it('shows nothing, and not a missing day, when no lines exist either', async () => {
      noPublishedToday({
        verses: [],
        book: { title: 'Old', author: 'Writer' },
      });

      const { api } = host(ref(null));
      await flushPromises();

      expect(api.haiku.value).toBeNull();
      expect(api.missing.value).toBeFalsy();
      expect(api.failed.value).toBeFalsy();
    });
  });

  describe('concurrent and stale loads', () => {
    it('shares one request between two readers of the same day', async () => {
      host(ref('2026-10-23'));
      host(ref('2026-10-23'));
      await flushPromises();

      expect(dailyCalls('2026-10-23')).toHaveLength(1);
    });

    it('swaps a cached unrecorded day in as missing without asking again', async () => {
      const day = ref<string | null>('2026-01-01');
      const { api } = host(day);
      await flushPromises();
      const before = query.mock.calls.length;

      day.value = '2026-10-23';
      await flushPromises();
      day.value = '2026-01-01';
      await nextTick();

      expect(api.missing.value).toBeTruthy();
      expect(api.haiku.value).toBeNull();
      expect(dailyCalls('2026-01-01')).toHaveLength(1);
      expect(query.mock.calls.length).toBeGreaterThan(before);
    });

    it('ignores the answer of a day the reader already left', async () => {
      let release!: () => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const fallback = query.getMockImplementation()!;
      query.mockImplementation((doc, vars: { date: string | null }) =>
        vars?.date === '2026-10-22'
          ? {
              toPromise: () => gate.then(() => fallback(doc, vars).toPromise()),
            }
          : fallback(doc, vars),
      );

      const day = ref<string | null>('2026-10-22');
      const { api } = host(day);
      await flushPromises();

      day.value = '2026-10-23';
      await flushPromises();
      release();
      await flushPromises();

      expect(api.haiku.value?.date).toBe('2026-10-23');
    });

    it('drops a failure of a day the reader already left, without retrying', async () => {
      let fail!: () => void;
      const gate = new Promise<void>((resolve) => {
        fail = resolve;
      });
      const fallback = query.getMockImplementation()!;
      query.mockImplementation((doc, vars: { date: string | null }) =>
        vars?.date === '2026-10-22'
          ? {
              toPromise: () =>
                gate.then(() => ({
                  data: undefined,
                  error: { message: 'offline' },
                })),
            }
          : fallback(doc, vars),
      );

      const day = ref<string | null>('2026-10-22');
      const { api } = host(day);
      await flushPromises();

      day.value = '2026-10-23';
      await flushPromises();
      fail();
      await vi.advanceTimersByTimeAsync(6000);
      await flushPromises();

      expect(api.failed.value).toBeFalsy();
      expect(api.haiku.value?.date).toBe('2026-10-23');
      expect(dailyCalls('2026-10-22')).toHaveLength(1);
    });

    it('stops retrying once the reader moves to another day during the wait', async () => {
      const fallback = query.getMockImplementation()!;
      query.mockImplementation((doc, vars: { date: string | null }) =>
        vars?.date === '2026-10-22'
          ? {
              toPromise: () =>
                Promise.resolve({
                  data: undefined,
                  error: { message: 'offline' },
                }),
            }
          : fallback(doc, vars),
      );

      const day = ref<string | null>('2026-10-22');
      const { api } = host(day);
      await flushPromises();
      expect(dailyCalls('2026-10-22')).toHaveLength(1);

      day.value = '2026-01-01';
      await vi.advanceTimersByTimeAsync(6000);
      await flushPromises();

      expect(dailyCalls('2026-10-22')).toHaveLength(1);
      expect(api.failed.value).toBeFalsy();
      expect(api.missing.value).toBeTruthy();
    });

    it('recovers when a retry succeeds', async () => {
      let attempts = 0;
      const fallback = query.getMockImplementation()!;
      query.mockImplementation((doc, vars) => {
        if (
          String(doc.loc?.source.body).includes('dailyHaiku(date') &&
          attempts++ === 0
        ) {
          return {
            toPromise: () =>
              Promise.resolve({ data: undefined, error: { message: 'blip' } }),
          };
        }

        return fallback(doc, vars);
      });

      const { api } = host(ref(null));
      await vi.advanceTimersByTimeAsync(1500);
      await flushPromises();

      expect(api.failed.value).toBeFalsy();
      expect(api.haiku.value?.date).toBe(TODAY);
    });

    it('lets the reader reload after a failure', async () => {
      let broken = true;
      const fallback = query.getMockImplementation()!;
      query.mockImplementation((doc, vars) =>
        broken && String(doc.loc?.source.body).includes('dailyHaiku(date')
          ? {
              toPromise: () =>
                Promise.resolve({
                  data: undefined,
                  error: { message: 'down' },
                }),
            }
          : fallback(doc, vars),
      );

      const { api } = host(ref(null));
      await vi.advanceTimersByTimeAsync(6000);
      await flushPromises();
      expect(api.failed.value).toBeTruthy();

      broken = false;
      await api.reload();

      expect(api.failed.value).toBeFalsy();
      expect(api.haiku.value?.date).toBe(TODAY);
    });
  });

  describe('prefetching', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('waits for an idle moment when the browser has one', async () => {
      const callbacks: Array<() => void> = [];
      const cancel = vi.fn();
      vi.stubGlobal('requestIdleCallback', (run: () => void) => {
        callbacks.push(run);

        return 7;
      });
      vi.stubGlobal('cancelIdleCallback', cancel);

      const { wrapper } = host(ref(null));
      await flushPromises();

      expect(callbacks).toHaveLength(1);
      expect(dailyCalls('2026-10-23')).toHaveLength(0);

      callbacks[0]();
      await flushPromises();
      expect(dailyCalls('2026-10-23')).toHaveLength(1);

      wrapper.unmount();
      expect(cancel).not.toHaveBeenCalled();
    });

    it('cancels a pending idle prefetch when the page goes away', async () => {
      const cancel = vi.fn();
      vi.stubGlobal('requestIdleCallback', () => 7);
      vi.stubGlobal('cancelIdleCallback', cancel);

      const { wrapper } = host(ref(null));
      await flushPromises();
      wrapper.unmount();

      expect(cancel).toHaveBeenCalledWith(7);
    });

    it('does not prefetch a day already cached', async () => {
      host(ref('2026-10-22'));
      await flushPromises();
      host(ref(null));
      await flushPromises();
      vi.advanceTimersByTime(250);
      await flushPromises();

      expect(dailyCalls('2026-10-22')).toHaveLength(1);
    });

    it('swallows a failed prefetch', async () => {
      const fallback = query.getMockImplementation()!;
      query.mockImplementation((doc, vars: { date: string | null }) =>
        vars?.date === '2026-10-23'
          ? {
              toPromise: () =>
                Promise.resolve({ data: undefined, error: { message: 'x' } }),
            }
          : fallback(doc, vars),
      );

      const { api } = host(ref(null));
      await flushPromises();
      vi.advanceTimersByTime(250);
      await flushPromises();

      expect(dailyCalls('2026-10-23')).toHaveLength(1);
      expect(api.failed.value).toBeFalsy();
    });
  });

  describe('the page state', () => {
    it('counts down to the computed rollover when the published one is unreadable', async () => {
      const fallback = query.getMockImplementation()!;
      query.mockImplementation((doc, vars) =>
        String(doc.loc?.source.body).includes('dailyHaiku(date')
          ? respond({
              dailyHaiku: {
                ...entry(TODAY, null, null),
                nextRolloverAt: 'not a date',
              },
            })
          : fallback(doc, vars),
      );

      const { api } = host(ref(null));
      await flushPromises();

      expect(api.countdown.value).not.toBeNull();
      expect(api.countdown.value?.due).toBeFalsy();
    });

    it('counts down to the computed rollover when none is published', async () => {
      const fallback = query.getMockImplementation()!;
      query.mockImplementation((doc, vars) =>
        String(doc.loc?.source.body).includes('dailyHaiku(date')
          ? respond({
              dailyHaiku: { ...entry(TODAY, null, null), nextRolloverAt: '' },
            })
          : fallback(doc, vars),
      );

      const { api } = host(ref(null));
      await flushPromises();

      expect(api.countdown.value?.due).toBeFalsy();
    });

    it('is today before anything has loaded only for the current page', () => {
      query.mockImplementation(() => ({
        toPromise: () => new Promise(() => {}),
      }));

      const current = host(ref(null));
      const past = host(ref('2026-10-23'));

      expect(current.api.isToday.value).toBeTruthy();
      expect(past.api.isToday.value).toBeFalsy();
      expect(current.api.haiku.value).toBeNull();
    });

    it('marks a loaded day other than the publication date as not today', async () => {
      const { api } = host(ref('2026-10-22'));
      await flushPromises();

      expect(api.haiku.value?.isToday).toBeFalsy();
    });

    it('does nothing at a tick while nothing has loaded', async () => {
      query.mockImplementation(() => ({
        toPromise: () => new Promise(() => {}),
      }));
      const { api } = host(ref(null));

      vi.advanceTimersByTime(60_000);
      await flushPromises();

      expect(api.haiku.value).toBeNull();
      expect(dailyCalls(null)).toHaveLength(1);
    });

    it('reloads at the rollover only once', async () => {
      host(ref(null));
      await flushPromises();
      vi.advanceTimersByTime(250);
      await flushPromises();
      const before = dailyCalls(null).length;

      vi.setSystemTime(new Date('2026-10-25T10:01:00Z'));
      vi.advanceTimersByTime(60_000);
      await flushPromises();
      const afterFirst = dailyCalls(null).length;
      vi.advanceTimersByTime(60_000);
      await flushPromises();

      expect(afterFirst).toBe(before + 1);
      expect(dailyCalls(null).length).toBe(afterFirst);
    });

    it('stops ticking and loading after unmount', async () => {
      const day = ref<string | null>('2026-10-23');
      const { wrapper } = host(day);
      await flushPromises();
      wrapper.unmount();
      const before = query.mock.calls.length;

      day.value = '2026-10-22';
      await flushPromises();

      expect(dailyCalls('2026-10-22')).toHaveLength(0);
      expect(query.mock.calls.length).toBe(before);
    });
  });
});
