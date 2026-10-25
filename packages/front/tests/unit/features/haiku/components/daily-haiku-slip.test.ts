import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick, reactive, ref } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

const query = vi.fn();
const route = reactive<{ query: Record<string, string | undefined> }>({
  query: {},
});
const replace = vi.fn((to: { query: Record<string, string> }) => {
  route.query = { ...to.query };

  return Promise.resolve();
});

vi.mock('@/client', () => ({
  urqlClient: { query: (...args: unknown[]) => query(...args) },
}));

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ replace }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key} ${JSON.stringify(params)}` : key,
    locale: ref('en'),
  }),
}));

// Lays out at once and says so, like pretext once its fonts are in
vi.mock('@/features/haiku/components/PretextChapter.vue', () => ({
  default: {
    emits: ['ready'],
    mounted() {
      this.$emit('ready');
    },
    template: '<span class="pretext-stub" />',
  },
}));

const { clearDailyHaikuCache } =
  await import('@/features/haiku/composables/daily-haiku');
const DailyHaikuSlip = (
  await import('@/features/haiku/components/DailyHaikuSlip.vue')
).default;

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
    excerpt: null as { text: string; verses: string[] } | null,
    book: { title: 'Book', author: 'Author', emoticons: null },
    cardUrl: null,
    nextRolloverAt: '2026-10-25T10:00:00.000Z',
    previousDate,
    nextDate,
  };
}

const archive: Record<string, ReturnType<typeof entry>> = {
  [TODAY]: entry(TODAY, '2026-10-23', null),
  '2026-10-23': entry('2026-10-23', '2026-10-22', TODAY),
  '2026-10-22': entry('2026-10-22', null, '2026-10-23'),
};

let wrapper: VueWrapper;

async function render(day?: string, props: Record<string, unknown> = {}) {
  route.query = day ? { day } : {};
  wrapper = mount(DailyHaikuSlip, {
    props,
    attachTo: document.body,
    global: {
      stubs: {
        transition: true,
        'i18n-t': { template: '<span><slot name="book" /></span>' },
      },
    },
  });
  await flushPromises();
  await nextTick();
}

const prev = () => wrapper.get<HTMLButtonElement>('[data-cy=daily-prev]');
const next = () => wrapper.get<HTMLButtonElement>('[data-cy=daily-next]');

describe('DailyHaikuSlip', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-24T12:00:00Z'));
    setActivePinia(createPinia());
    clearDailyHaikuCache();
    replace.mockClear();
    query.mockReset();
    query.mockImplementation((_doc, vars: { date: string | null }) => ({
      toPromise: () =>
        Promise.resolve({
          data: { dailyHaiku: archive[vars.date ?? TODAY] ?? null },
        }),
    }));
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
  });

  it('names itself before the title', async () => {
    await render();

    const head = wrapper.get('.daily-slip__head').element;
    const title = wrapper.get('.daily-slip__title').element;

    expect(
      head.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('folds the reading when asked', async () => {
    archive[TODAY] = { ...archive[TODAY], reading: 'A long reading.' };

    try {
      await render(undefined, { foldReading: true });

      expect(wrapper.find('.daily-slip__reading-text').exists()).toBeFalsy();
      expect(
        wrapper.find('[data-cy=daily-reading-toggle]').exists(),
      ).toBeTruthy();
    } finally {
      archive[TODAY] = { ...archive[TODAY], reading: null };
    }
  });

  it("shows today's countdown and no way forward", async () => {
    await render();

    expect(wrapper.find('[data-cy=daily-today]').exists()).toBeFalsy();
    expect(wrapper.find('.daily-slip__next').exists()).toBeTruthy();
    expect(next().element.disabled).toBeTruthy();
    expect(prev().element.disabled).toBeFalsy();
    expect(prev().attributes('aria-label')).toContain(
      'home.daily.nav.previous',
    );
  });

  it('steps back through the URL and offers the way back to today', async () => {
    await render();
    await prev().trigger('click');
    await flushPromises();

    expect(replace).toHaveBeenLastCalledWith({ query: { day: '2026-10-23' } });
    expect(wrapper.get('[data-cy=daily-date]').attributes('datetime')).toBe(
      '2026-10-23',
    );
    expect(wrapper.find('[data-cy=daily-today]').exists()).toBeTruthy();
    expect(wrapper.find('.daily-slip__next').exists()).toBeFalsy();

    await wrapper.get('[data-cy=daily-today]').trigger('click');
    await flushPromises();
    expect(replace).toHaveBeenLastCalledWith({ query: {} });
  });

  it('disables the previous step at the start of the archive', async () => {
    await render('2026-10-22');

    expect(prev().element.disabled).toBeTruthy();
    expect(next().element.disabled).toBeFalsy();
  });

  it('turns pages with the arrow keys while focus is inside', async () => {
    await render();
    prev().element.focus();
    await wrapper.get('article').trigger('keydown', { key: 'ArrowLeft' });
    await flushPromises();

    expect(route.query.day).toBe('2026-10-23');
    expect(document.activeElement).toBe(prev().element);

    await wrapper.get('article').trigger('keydown', { key: 'ArrowRight' });
    await flushPromises();
    expect(route.query.day).toBeUndefined();
  });

  it('closes the source when the day changes', async () => {
    await render();
    await wrapper.get('[data-cy=daily-trace-toggle]').trigger('click');
    expect(
      wrapper.get('[data-cy=daily-trace-toggle]').attributes('aria-expanded'),
    ).toBe('true');

    await prev().trigger('click');
    await flushPromises();
    await nextTick();
    expect(wrapper.get('[data-cy=daily-date]').attributes('datetime')).toBe(
      '2026-10-23',
    );
    expect(wrapper.get('h3').text()).toBe('Title 2026-10-23');
    expect(
      wrapper.get('[data-cy=daily-trace-toggle]').attributes('aria-expanded'),
    ).toBe('false');
  });

  it.each(['not-a-date', '2026-02-30', '2026-10-30', TODAY])(
    'strips an unusable ?day=%s',
    async (day) => {
      await render(day);

      expect(replace).toHaveBeenCalledWith({ query: {} });
      expect(wrapper.get('[data-cy=daily-date]').attributes('datetime')).toBe(
        TODAY,
      );
    },
  );

  it('says when a past day has no haiku', async () => {
    await render('2025-01-01');

    expect(wrapper.find('[data-cy=daily-missing]').text()).toBe(
      'home.daily.missing',
    );
    expect(wrapper.find('[data-cy=daily-today]').exists()).toBeTruthy();
  });

  describe('the first-visit blackout', () => {
    const excerpt = {
      text: 'and one more … two here … three',
      verses: ['one', 'two', 'three'],
    };

    async function withExcerpt(run: () => Promise<void>) {
      archive[TODAY] = { ...archive[TODAY], excerpt };

      try {
        await run();
      } finally {
        archive[TODAY] = { ...archive[TODAY], excerpt: null };
      }
    }

    const lines = () => wrapper.get('.daily-slip__lines');

    it('blacks out a page of the chapter over the verses, then gives them back', async () => {
      vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
      vi.setSystemTime(new Date('2026-10-24T12:00:00Z'));

      await withExcerpt(async () => {
        await render(undefined, { entrance: true });
        await vi.dynamicImportSettled();
        await flushPromises();

        expect(wrapper.find('.daily-blackout.is-ready').exists()).toBeTruthy();
        expect(lines().classes()).toContain('is-under-blackout');

        vi.advanceTimersByTime(2000);
        await flushPromises();

        expect(wrapper.find('.daily-blackout').exists()).toBeFalsy();
        expect(lines().classes()).not.toContain('is-under-blackout');
        // The seal presses once the verses stand alone
        expect(wrapper.find('.ink-stamp--press').exists()).toBeTruthy();
      });
    });

    it('stays out of a later visit', async () => {
      await withExcerpt(async () => {
        await render();

        expect(wrapper.find('.daily-blackout').exists()).toBeFalsy();
        expect(lines().classes()).not.toContain('is-under-blackout');
        expect(wrapper.find('.ink-stamp--press').exists()).toBeFalsy();
      });
    });

    it('needs an excerpt', async () => {
      await render(undefined, { entrance: true });

      expect(wrapper.find('.daily-blackout').exists()).toBeFalsy();
    });
  });
});
