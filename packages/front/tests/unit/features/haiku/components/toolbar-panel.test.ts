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

  it('stays simple: a title, the key, then one row of icons', () => {
    setActivePinia(createPinia());
    const store = useHaikuStore();
    store.firstLoaded = true;
    store.haiku = {
      verses: ['a', 'b', 'c'],
      image: 'data:image/png;base64,x',
      book: { title: 'W', author: 'T', reference: '1' },
      chapter: { title: '', content: '' },
    } as never;
    const wrapper = mount(ToolbarPanel, {
      global: {
        stubs: {
          ZenCard: { template: '<div><slot /></div>' },
          ZenTooltip: { template: '<div><slot /></div>' },
          AiKeyPanel: true,
        },
      },
    });

    expect(wrapper.get('.toolbar-panel__header-title').text()).toBe(
      'toolbar.title',
    );
    expect(wrapper.get('.toolbar-panel__header-subtitle').text()).toBe(
      'toolbar.subtitle',
    );

    const row = wrapper.get('.toolbar-panel__secondary');
    const keys = row.findAll('button');

    // The history arrows frame what can be done with the haiku
    expect(keys).toHaveLength(5);
    expect(keys[0].attributes('aria-label')).toContain(
      'toolbar.previousTooltip',
    );
    expect(keys[1].attributes('data-cy')).toBe('copy-btn');
    expect(keys[2].attributes('data-cy')).toBe('share-btn');
    expect(keys[3].attributes('data-cy')).toBe('download-btn');
    expect(keys[4].attributes('aria-label')).toContain('toolbar.nextTooltip');
    // Icons only: every key is named, none prints a word
    for (const key of keys) {
      expect(key.attributes('aria-label')).toBeTruthy();
      expect(key.text()).toBe('');
    }
  });
});
