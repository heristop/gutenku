import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { nextTick, ref } from 'vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref('en') }),
}));

const mounts = vi.fn();

const { useHaikuStore } = await import('@/features/haiku/store/haiku');
const ToolbarPanel = (
  await import('@/features/haiku/components/ToolbarPanel.vue')
).default;

describe('ToolbarPanel', () => {
  it('keeps what the reader opened open across a craft', async () => {
    setActivePinia(createPinia());
    const store = useHaikuStore();
    store.firstLoaded = true;
    mount(ToolbarPanel, {
      global: {
        stubs: {
          ZenCard: { template: '<div><slot /></div>' },
          ZenTooltip: { template: '<div><slot /></div>' },
          AiKeyPanel: {
            mounted: () => mounts(),
            template: '<div class="ai-key-stub" />',
          },
        },
      },
    });

    expect(mounts).toHaveBeenCalledTimes(1);

    store.isGenerating = true;
    await nextTick();
    store.isGenerating = false;
    await nextTick();

    // The same AI options, still in whatever state the reader left them
    expect(mounts).toHaveBeenCalledTimes(1);
  });
});
