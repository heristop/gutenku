import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createSSRApp, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { gameEnabled } from './game-enabled';

const isMuted = ref(true);
const toggleMute = vi.fn(() => {
  isMuted.value = !isMuted.value;
});

vi.mock('@/features/game/composables/audio-feedback', () => ({
  useAudioFeedback: () => ({ isMuted, toggleMute }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref('en') }),
}));

vi.mock('@/locales', () => ({
  i18n: { global: { t: (key: string) => key } },
}));

const stubs = {
  ZenTooltip: { template: '<div><slot /></div>' },
  ZenButton: {
    inheritAttrs: false,
    template:
      '<button v-bind="$attrs" type="button"><slot name="icon-left" /><slot /></button>',
  },
  InkStamp: true,
  InkDrops: true,
  ZenModal: { template: '<div><slot /></div>' },
  BrushRule: true,
};

describe.runIf(gameEnabled)('sound key', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    isMuted.value = true;
    toggleMute.mockClear();
  });

  it('sits in the header, named "Sound", pressed only when sound is on', async () => {
    const GameHeader = (
      await import('@/features/game/components/GameHeader.vue')
    ).default;
    const wrapper = mount(GameHeader, { global: { stubs } });
    const key = wrapper.get('[aria-label="game.sound"]');

    expect(key.attributes('aria-pressed')).toBe('false');
    await key.trigger('click');
    expect(toggleMute).toHaveBeenCalledOnce();
    expect(
      wrapper.get('[aria-label="game.sound"]').attributes('aria-pressed'),
    ).toBe('true');
  });

  it('renders the prerendered state first, then the stored choice', async () => {
    isMuted.value = false;
    const GameHeader = (
      await import('@/features/game/components/GameHeader.vue')
    ).default;

    // The prerender can't read the stored choice: until mount the key must
    // match it, or hydration keeps a stale "not pressed"
    const app = createSSRApp(GameHeader);
    app.use(createPinia());
    app.config.globalProperties.$t = (key: string) => key;
    const html = await renderToString(app);

    expect(html).toContain('aria-pressed="false"');

    const wrapper = mount(GameHeader, { global: { stubs } });
    await nextTick();

    expect(
      wrapper.get('[aria-label="game.sound"]').attributes('aria-pressed'),
    ).toBe('true');
  });

  it('has left the help panel', async () => {
    const GameHelp = (await import('@/features/game/components/GameHelp.vue'))
      .default;
    const wrapper = mount(GameHelp, {
      props: { modelValue: true },
      global: { stubs },
    });

    expect(wrapper.find('[aria-pressed]').exists()).toBeFalsy();
  });

  it('counts down to the next classic once the game is over', async () => {
    const { useGameStore } = await import('@/features/game/store/game');
    const store = useGameStore();
    store.puzzle = {
      date: '2026-10-25',
      puzzleNumber: 298,
      hints: [],
      haikus: [],
      emoticonCount: 5,
      visibleIndices: [],
      nextPuzzleAvailableAt: new Date(
        Date.now() + (5 * 60 + 57) * 60_000 + 30_000,
      ).toISOString(),
    } as never;
    const GameHeader = (
      await import('@/features/game/components/GameHeader.vue')
    ).default;

    const playing = mount(GameHeader, { global: { stubs } });
    expect(playing.find('.stat-group--next').exists()).toBeFalsy();
    playing.unmount();

    store.currentGame = {
      date: '2026-10-25',
      puzzleNumber: 298,
      guesses: [],
      isComplete: true,
      isWon: false,
    } as never;
    const finished = mount(GameHeader, { global: { stubs } });
    const next = finished.get('.stat-group--next');

    expect(next.text()).toContain('game.result.nextIn');
    expect(next.text()).toMatch(/05:57:\d\d/);
    finished.unmount();
  });
});
