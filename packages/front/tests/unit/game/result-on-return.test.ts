import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import { gameEnabled } from './game-enabled';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref('en') }),
}));

vi.mock('@/locales', () => ({
  i18n: { global: { t: (key: string) => key } },
}));

describe.runIf(gameEnabled)('a finished game, on return', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('never reopens the result sheet by itself', async () => {
    const { getGamePersistConfig } =
      await import('@/features/game/store/game-store-helpers');
    const config = getGamePersistConfig();

    // The open sheet is a moment, not a state: it is not kept across visits
    expect(config && config.pick).not.toContain('showResult');
  });

  it('shows the result, clock running, when asked for', async () => {
    const { useGameStore } = await import('@/features/game/store/game');
    const store = useGameStore();
    store.puzzle = {
      date: '2026-10-25',
      puzzleNumber: 298,
      hints: [],
      haikus: [],
      emoticonCount: 5,
      visibleIndices: [],
      nextPuzzleAvailableAt: new Date(Date.now() + 3_600_000).toISOString(),
    } as never;
    store.currentGame = {
      date: '2026-10-25',
      puzzleNumber: 298,
      guesses: [],
      isComplete: true,
      isWon: false,
      correctBook: { title: 'Emma', author: 'Jane Austen', reference: '158' },
    } as never;

    const ResultColophon = (
      await import('@/features/game/components/ResultColophon.vue')
    ).default;
    const wrapper = mount(ResultColophon, {
      props: { active: true },
      global: { stubs: { ColophonTable: true } },
    });

    expect(wrapper.get('.colophon-page__title').text()).toContain(
      'game.result.itWas',
    );
    expect(wrapper.get('[role=timer]').text()).toMatch(/\d/);
    wrapper.unmount();
  });
});
