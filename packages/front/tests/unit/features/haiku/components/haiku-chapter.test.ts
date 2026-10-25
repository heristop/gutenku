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
const HaikuChapter = (
  await import('@/features/haiku/components/HaikuChapter.vue')
).default;

describe('HaikuChapter', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'fonts', {
      value: { ready: Promise.resolve() },
      configurable: true,
    });
    setActivePinia(createPinia());
    const store = useHaikuStore();
    store.haiku = {
      verses: ['a', 'b', 'c'],
      rawVerses: ['a', 'b', 'c'],
      book: { title: 'Walden', author: 'Thoreau', reference: '205' },
      chapter: { title: 'One', content: 'a b c' },
    } as never;
  });

  it('opens compacted, with no floating crafting card', async () => {
    // A laid-out card, so a floating card would have somewhere to sit
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 0,
      width: 600,
    } as DOMRect);
    const store = useHaikuStore();
    store.loading = true;
    store.craftingMessages = [
      {
        id: '1',
        text: 'a / b / c',
        verses: ['a', 'b', 'c'],
        timestamp: 1,
        icon: {} as never,
      },
    ];
    const wrapper = mount(HaikuChapter, {
      attachTo: document.body,
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          ZenCard: { template: '<div><slot /></div>' },
          PretextChapter: { props: ['text'], template: '<p>{{ text }}</p>' },
          HighLightText: { props: ['text'], template: '<p>{{ text }}</p>' },
          MarkerOverlay: true,
          ZenTooltip: { template: '<div><slot /></div>' },
          teleport: true,
        },
      },
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    expect(wrapper.find('.chapter-content').classes()).not.toContain(
      'expandable',
    );
    expect(document.body.querySelector('.crafting-messages-teleported')).toBe(
      null,
    );
    wrapper.unmount();
  });
});
