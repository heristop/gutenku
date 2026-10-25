import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';

const navigated = ref(false);

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref('en') }),
}));

vi.mock('@unhead/vue', () => ({ useSeoMeta: () => {} }));

vi.mock('@/core/composables/view-transition', () => ({
  hasPageNavigated: () => navigated.value,
}));

vi.mock('@/features/blog/composables', () => ({
  toRomanNumeral: (n: number) => ['', 'I', 'II'][n] ?? '',
  useArticles: () => ({
    articles: ref([
      {
        slug: 'second',
        title: 'Second',
        description: 'Two',
        content: 'x',
        date: new Date('2026-01-17'),
      },
      {
        slug: 'first',
        title: 'First',
        description: 'One',
        content: 'x',
        date: new Date('2026-01-13'),
      },
    ]),
    formatDate: (d: Date) => d.toISOString().slice(0, 10),
    getReadingTime: () => 1,
  }),
}));

const BlogIndex = (await import('@/features/blog/views/BlogIndex.vue')).default;

const stubs = { RouterLink: { template: '<a><slot /></a>' } };

describe('BlogIndex', () => {
  beforeEach(() => {
    navigated.value = false;
  });

  it('files each issue in the gutter and points every entry onward', () => {
    const wrapper = mount(BlogIndex, { global: { stubs } });
    const cards = wrapper.findAll('.blog-index__card');

    expect(cards).toHaveLength(2);

    for (const card of cards) {
      expect(card.find('.blog-index__issue').exists()).toBeTruthy();
      expect(card.find('.blog-index__onward').attributes('aria-hidden')).toBe(
        'true',
      );
    }
  });

  it('sets the list down on a fresh load only', () => {
    const fresh = mount(BlogIndex, { global: { stubs } });

    expect(fresh.get('.blog-index__list').classes()).not.toContain('is-quiet');
    // Each issue is sealed as its entry lands
    expect(fresh.findAll('.blog-index__issue .ink-stamp--press')).toHaveLength(
      2,
    );

    navigated.value = true;
    const returning = mount(BlogIndex, { global: { stubs } });

    expect(returning.get('.blog-index__list').classes()).toContain('is-quiet');
    expect(returning.find('.ink-stamp--press').exists()).toBeFalsy();
  });
});
