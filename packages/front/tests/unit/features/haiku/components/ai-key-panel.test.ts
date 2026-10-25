import { describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref('en') }),
}));

// The check never answers: the key stays in its "checking" state
vi.mock('@/client', () => ({
  urqlClient: {
    mutation: () => ({ toPromise: () => new Promise(() => {}) }),
  },
}));

const { useHaikuStore } = await import('@/features/haiku/store/haiku');
const AiKeyPanel = (await import('@/features/haiku/components/AiKeyPanel.vue'))
  .default;

describe('AiKeyPanel', () => {
  it('keeps the check key one width while it checks', async () => {
    setActivePinia(createPinia());
    useHaikuStore().optionUseAI = true;
    const wrapper = mount(AiKeyPanel, {
      global: { stubs: { transition: false } },
    });

    // No header of its own: the crafting panel's Options key opens it
    expect(wrapper.find('.ai-key__header').exists()).toBeFalsy();
    const input = wrapper.get('#ai-key-input');
    await input.setValue(`sk-test-${'x'.repeat(30)}`);
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    const check = wrapper.get('.ai-key__check');
    const labels = check.findAll('.ai-key__check-label');

    // Both words are set, one over the other: the key is as wide as the
    // longer, and only the current one shows (and is read out)
    expect(labels.map((label) => label.text())).toEqual([
      'aiKey.check',
      'aiKey.checking',
    ]);
    expect(check.get('.ai-key__check-label--current').text()).toBe(
      'aiKey.checking',
    );
  });
});
