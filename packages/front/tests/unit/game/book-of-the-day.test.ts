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

  it('opens the summary with a capital instead of a quote mark', async () => {
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
        summary: 'Emma Woodhouse, handsome, clever, and rich.',
      },
    } as never;
    const BookOfTheDay = (
      await import('@/features/game/components/BookOfTheDay.vue')
    ).default;
    const wrapper = mount(BookOfTheDay, {
      global: { stubs: { ZenButton: true } },
    });

    const summary = wrapper.get('.book-entry__summary p');
    expect(summary.classes()).toContain('gk-drop-cap');
    expect(wrapper.find('.book-entry__quote').exists()).toBeFalsy();
  });
});
