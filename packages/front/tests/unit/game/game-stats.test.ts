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

vi.mock('@/core/composables/global-stats', () => ({
  useGlobalStats: () => ({
    globalStats: ref({
      todayGamesPlayed: 0,
      todayAverageEmoticonScratches: 0,
      todayAverageHaikuReveals: 0,
    }),
    fetchGlobalStats: vi.fn(),
  }),
}));

const stubs = {
  ZenModal: { template: '<div><slot /></div>' },
  BrushRule: true,
  InkDrops: true,
};

describe.runIf(gameEnabled)('GameStats first run', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  async function stats(gamesPlayed: number) {
    const { useGameStore } = await import('@/features/game/store/game');
    const store = useGameStore();
    store.stats.gamesPlayed = gamesPlayed;
    store.currentGame = {
      date: '2026-10-25',
      guesses: [],
      revealedHaikus: [0],
      scratchedPositions: [],
    } as never;
    const GameStats = (await import('@/features/game/components/GameStats.vue'))
      .default;

    return mount(GameStats, { props: { modelValue: true }, global: { stubs } });
  }

  it('files a first colophon line instead of zeros', async () => {
    const wrapper = await stats(0);

    expect(wrapper.find('.game-stats__empty').text()).toBe('game.stats.empty');
    expect(wrapper.find('.stats-table').exists()).toBeFalsy();
    expect(wrapper.find('.distribution').exists()).toBeFalsy();
  });

  it('keeps the figures once a game is played', async () => {
    const wrapper = await stats(3);

    expect(wrapper.find('.game-stats__empty').exists()).toBeFalsy();
    expect(wrapper.find('.stats-table').exists()).toBeTruthy();
  });

  it('does not count the free first haiku as a reveal', async () => {
    const wrapper = await stats(0);
    const row = wrapper
      .findAll('.ledger tr')
      .find((r) => r.text().includes('game.stats.haikuReveals'));

    expect(row?.find('td').text()).toBe('0');
  });
});
