import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, nextTick, ref, type Ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

const query = vi.fn();

vi.mock('@/client', () => ({
  urqlClient: { query: (...args: unknown[]) => query(...args) },
}));

vi.mock('@/core/components/icons/ink', () => ({ Leaf: {} }));

const { clearDailyHaikuCache, useDailyHaiku } =
  await import('@/features/haiku/composables/daily-haiku');

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
});
