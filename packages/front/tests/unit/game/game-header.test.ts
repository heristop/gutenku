import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
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

  it('has left the help panel', async () => {
    const GameHelp = (await import('@/features/game/components/GameHelp.vue'))
      .default;
    const wrapper = mount(GameHelp, {
      props: { modelValue: true },
      global: { stubs },
    });

    expect(wrapper.find('[aria-pressed]').exists()).toBeFalsy();
  });
});
