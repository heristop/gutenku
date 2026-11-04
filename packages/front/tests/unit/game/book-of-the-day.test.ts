import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import { gameEnabled } from './game-enabled';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    te: () => false,
    locale: ref('en'),
  }),
}));

vi.mock('@/locales', () => ({
  i18n: { global: { t: (key: string) => key } },
}));

describe.runIf(gameEnabled)('BookOfTheDay', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // The cover waits for the viewport: a constructible observer that never fires
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['Emma Woodhouse, handsome, clever, and rich.', true],
    ['« Appelez-moi Ismaël » — et rejoignez-le à bord.', false],
    ['“Call me Ishmael”—and join him aboard the Pequod.', false],
    ['「私をイシュマエルと呼んでくれ」', false],
  ])('only enlarges a letter at the start of %s', async (text, dropCap) => {
    const { useGameStore } = await import('@/features/game/store/game');
    useGameStore().currentGame = {
      date: '2026-10-25',
      puzzleNumber: 298,
      guesses: [],
      isComplete: true,
      isWon: true,
      correctBook: {
        title: 'Emma',
        author: 'Jane Austen',
        reference: '158',
        summary: text,
      },
    } as never;
    const BookOfTheDay = (
      await import('@/features/game/components/BookOfTheDay.vue')
    ).default;
    const wrapper = mount(BookOfTheDay, {
      global: { stubs: { ZenButton: true } },
    });

    const summary = wrapper.get('.book-entry__summary p');
    expect(summary.classes().includes('gk-drop-cap')).toBe(dropCap);
    expect(wrapper.find('.book-entry__quote').exists()).toBeFalsy();
    expect(wrapper.find('.book-discovery').exists()).toBeFalsy();
    wrapper.unmount();
  });

  it.each([true, false])(
    'shares an anecdote after a completed game (won=%s)',
    async (won) => {
      const { useGameStore } = await import('@/features/game/store/game');
      const store = useGameStore();
      store.currentGame = {
        date: '2026-11-04',
        puzzleNumber: 308,
        guesses: [],
        isComplete: true,
        isWon: won,
        correctBook: {
          title: 'Alice',
          author: 'Lewis Carroll',
          reference: '11',
          anecdote: 'Alice began as a story told on a boat trip in 1862.',
        },
      } as never;
      const BookOfTheDay = (
        await import('@/features/game/components/BookOfTheDay.vue')
      ).default;
      const wrapper = mount(BookOfTheDay, {
        global: { stubs: { ZenButton: true } },
      });
      expect(wrapper.get('.book-discovery').text()).toContain(
        'Alice began as a story told on a boat trip in 1862.',
      );
      await wrapper.setProps({ active: false });
      expect(
        wrapper.getComponent({ name: 'BookDiscovery' }).props('active'),
      ).toBeFalsy();
      await wrapper.setProps({ active: true });
      store.showResult = true;
      await wrapper.vm.$nextTick();
      expect(
        wrapper.getComponent({ name: 'BookDiscovery' }).props('active'),
      ).toBeFalsy();
      store.currentGame!.isComplete = false;
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.book-discovery').exists()).toBeFalsy();
      wrapper.unmount();
    },
  );
});
