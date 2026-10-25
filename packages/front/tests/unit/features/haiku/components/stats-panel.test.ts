import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key} ${JSON.stringify(params)}` : key,
    locale: ref('en'),
  }),
}));

const { useHaikuStore } = await import('@/features/haiku/store/haiku');
const { useBookRedaction } =
  await import('@/features/haiku/composables/book-redaction');
const StatsPanel = (await import('@/features/haiku/components/StatsPanel.vue'))
  .default;

describe('StatsPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const store = useHaikuStore();
    store.haiku = {
      verses: ['a', 'b', 'c'],
      book: { title: 'Walden', author: 'Thoreau', reference: '205' },
    } as never;
    store.stats.bookCounts = { Walden: 3, Emma: 1 };
    useBookRedaction().hideAgain();
  });

  it("keeps today's hidden book hidden in the list", () => {
    const wrapper = mount(StatsPanel);
    const titles = wrapper
      .findAll('.stats-panel__book-title')
      .map((t) => t.text());

    expect(titles).toEqual(['▬▬▬', 'Emma']);
  });

  it('names it once the reader reveals it', async () => {
    const wrapper = mount(StatsPanel);

    useBookRedaction().reveal();
    await wrapper.vm.$nextTick();

    expect(
      wrapper.findAll('.stats-panel__book-title').map((t) => t.text()),
    ).toEqual(['Walden', 'Emma']);
  });
});
