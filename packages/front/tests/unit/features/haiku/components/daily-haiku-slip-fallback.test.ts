import { describe, it, expect, vi, afterEach } from 'vitest';
import { reactive, ref } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

// A bad network: the blackout's chunk never arrives (a failed chunk ends the
// same way, through the slip's guard)
vi.mock(
  '@/features/haiku/components/DailyHaikuBlackout.vue',
  () => new Promise(() => {}),
);

const route = reactive<{ query: Record<string, string | undefined> }>({
  query: {},
});

vi.mock('@/client', () => ({
  urqlClient: {
    query: () => ({
      toPromise: () =>
        Promise.resolve({
          data: {
            dailyHaiku: {
              date: '2026-10-24',
              publishedAt: '2026-10-24T10:00:00.000Z',
              title: 'Title',
              verses: ['one', 'two', 'three'],
              reading: null,
              book: { title: 'Book', author: 'Author', emoticons: null },
              cardUrl: null,
              nextRolloverAt: '2026-10-25T10:00:00.000Z',
              previousDate: null,
              nextDate: null,
              excerpt: {
                text: 'and one … two … three',
                verses: ['one', 'two', 'three'],
              },
            },
          },
        }),
    }),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref('en') }),
}));

const { clearDailyHaikuCache } =
  await import('@/features/haiku/composables/daily-haiku');
const DailyHaikuSlip = (
  await import('@/features/haiku/components/DailyHaikuSlip.vue')
).default;

let wrapper: VueWrapper;

describe('DailyHaikuSlip blackout fallback', () => {
  afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
  });

  it('gives the verses back when the blackout never loads', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(new Date('2026-10-24T12:00:00Z'));
    setActivePinia(createPinia());
    clearDailyHaikuCache();

    wrapper = mount(DailyHaikuSlip, {
      props: { entrance: true },
      global: {
        stubs: {
          transition: true,
          'i18n-t': { template: '<span />' },
        },
      },
    });
    await flushPromises();
    vi.advanceTimersByTime(400);
    await flushPromises();

    const lines = wrapper.get('.daily-slip__lines');

    expect(lines.classes()).not.toContain('is-under-blackout');
    // Nothing was blacked out, so nothing is sealed
    expect(wrapper.find('.ink-stamp--press').exists()).toBeFalsy();
  });
});
