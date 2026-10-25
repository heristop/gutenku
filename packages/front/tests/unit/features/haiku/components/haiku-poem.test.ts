import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: ref('en'),
  }),
}));

const { useHaikuStore } = await import('@/features/haiku/store/haiku');
const HaikuPoem = (await import('@/features/haiku/components/HaikuPoem.vue'))
  .default;

const stubs = { 'i18n-t': { template: '<span />' }, InkStamp: true };

describe('HaikuPoem', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useHaikuStore().haiku = {
      verses: ['old one', 'old two', 'old three'],
      book: { title: 'Walden', author: 'Thoreau', reference: '205' },
      chapter: { title: '', content: '' },
    } as never;
  });

  it('shows the latest candidate on the leaf while crafting', () => {
    const store = useHaikuStore();
    store.isGenerating = true;
    store.craftingMessages = [
      {
        id: '2',
        text: 'new one / new two / new three',
        verses: ['new one', 'new two', 'new three'],
        timestamp: 2,
        icon: {} as never,
      },
    ];
    const wrapper = mount(HaikuPoem, { global: { stubs } });
    const verses = wrapper.find('.haiku-poem__verses');

    expect(verses.classes()).toContain('haiku-poem__verses--draft');
    expect(verses.text()).toContain('new two');
    expect(verses.text()).not.toContain('old two');
    expect(wrapper.find('[aria-live="polite"]').text()).toBe(
      'new one / new two / new three',
    );
  });

  it('shows the haiku itself when not crafting', () => {
    const wrapper = mount(HaikuPoem, { global: { stubs } });
    const verses = wrapper.find('.haiku-poem__verses');

    expect(verses.classes()).not.toContain('haiku-poem__verses--draft');
    expect(verses.text()).toContain('old two');
  });

  it('presses the seal on a crafted haiku only', () => {
    const crafted = mount(HaikuPoem, { global: { stubs } });

    expect(crafted.find('.haiku-poem__stamp').attributes('stamp')).toBe('true');

    useHaikuStore().isDailyHaiku = true;
    const daily = mount(HaikuPoem, { global: { stubs } });

    expect(daily.find('.haiku-poem__stamp').attributes('stamp')).toBe('false');
  });
});
