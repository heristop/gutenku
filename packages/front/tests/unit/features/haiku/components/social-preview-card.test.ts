import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { generateSocialCaption, type HaikuValue } from '@gutenku/shared';

const haiku = ref<HaikuValue | null>(null);
const loading = ref(false);
const copied = ref(false);
const copy = vi.fn(async () => {
  copied.value = true;

  return true;
});

vi.mock('@/features/haiku/store/haiku', () => ({
  useHaikuStore: () => ({ haiku, loading }),
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal<typeof import('pinia')>()),
  storeToRefs: (store: object) => store,
}));

vi.mock('@/core/composables/clipboard', () => ({
  useClipboard: () => ({ copy, copied }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref('en') }),
}));

const SocialPreviewCard = (
  await import('@/features/haiku/components/SocialPreviewCard.vue')
).default;

const sample = {
  title: 'Palsy at the Threshold',
  verses: ['one', 'two', 'three'],
  translations: { fr: 'un', jp: null },
  book: { title: 'The Book', author: 'Mark Twain', emoticons: '📚🌊' },
} as unknown as HaikuValue;

describe('SocialPreviewCard', () => {
  beforeEach(() => {
    haiku.value = null;
    copied.value = false;
    copy.mockClear();
  });

  it('shows a placeholder until a haiku with translations exists', () => {
    const wrapper = mount(SocialPreviewCard);

    expect(wrapper.find('.social-panel__placeholder').exists()).toBeTruthy();
    expect(wrapper.find('.social-panel__caption').exists()).toBeFalsy();
  });

  it('sets the caption exactly as generated, with its character count', () => {
    haiku.value = sample;
    const wrapper = mount(SocialPreviewCard);
    const caption = generateSocialCaption(sample);

    expect(wrapper.find('.social-panel__caption').text()).toBe(caption.trim());
    expect(wrapper.find('.social-panel__count').text()).toContain(
      [...caption].length.toLocaleString('en'),
    );
  });

  it('copies the caption and announces it', async () => {
    haiku.value = sample;
    const wrapper = mount(SocialPreviewCard);

    await wrapper.find('.social-panel__copy').trigger('click');
    await flushPromises();

    expect(copy).toHaveBeenCalledWith(generateSocialCaption(sample));
    expect(wrapper.find('.social-panel__copy').text()).toContain('Copied');
    expect(wrapper.find('[role="status"]').text()).toBe(
      'Caption copied to clipboard',
    );
  });
});
