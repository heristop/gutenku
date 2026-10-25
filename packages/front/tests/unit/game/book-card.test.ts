import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { gameEnabled } from './game-enabled';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref('en') }),
}));

const book = { id: '1', title: 'Walden', author: 'Thoreau', reference: '205' };
const stubs = {
  InkStamp: {
    props: ['stamp', 'tilt', 'size'],
    template:
      '<span class="stamp-stub" :data-stamp="String(stamp)" :data-tilt="tilt"><slot /></span>',
  },
};

describe.runIf(gameEnabled)('BookCard miss', () => {
  async function card(state: string) {
    const BookCard = (await import('@/features/game/components/BookCard.vue'))
      .default;

    return mount(BookCard, { props: { book, state }, global: { stubs } });
  }

  it('stamps a miss on its cover', async () => {
    const wrapper = await card('wrong');
    const stamp = wrapper.get('.book-card__miss-stamp');

    expect(stamp.attributes('data-tilt')).toBe('-8');
  });

  it('keeps the stamp out of the dimmed, clipped cover', async () => {
    const wrapper = await card('wrong');
    const stamp = wrapper.get('.book-card__miss-stamp').element;

    // The cover is greyed and clipped on a miss: a red stamp inside it would
    // turn grey and lose its press
    expect(stamp.closest('.book-card__cover')).toBe(null);
    expect(stamp.closest('.book-card__plate')).not.toBe(null);
  });

  it('leaves other books unstamped', async () => {
    expect(
      (await card('normal')).find('.book-card__miss-stamp').exists(),
    ).toBeFalsy();
  });

  it('shows a restored miss without pressing it again', async () => {
    const wrapper = await card('wrong');

    expect(wrapper.get('.book-card__miss-stamp').attributes('data-stamp')).toBe(
      'false',
    );
  });

  it('presses the stamp when a guess turns into a miss', async () => {
    const wrapper = await card('normal');

    await wrapper.setProps({ state: 'wrong' });

    expect(wrapper.get('.book-card__miss-stamp').attributes('data-stamp')).toBe(
      'true',
    );
  });
});
