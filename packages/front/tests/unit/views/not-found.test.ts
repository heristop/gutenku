import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import fr from '@/locales/fr.json';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    tm: (key: string) =>
      key
        .split('.')
        .reduce<unknown>(
          (node, part) => (node as Record<string, unknown>)?.[part],
          fr,
        ),
    rt: (value: string) => value,
  }),
}));

const NotFound = (await import('@/views/NotFound.vue')).default;

describe('NotFound', () => {
  it('reads its haiku from the locale', () => {
    const wrapper = mount(NotFound, {
      global: {
        stubs: {
          ZenHaiku: {
            props: ['lines'],
            template: '<p class="haiku">{{ lines.join(" / ") }}</p>',
          },
          ZenButton: true,
          ZenCard: { template: '<div><slot /></div>' },
          BrushRule: true,
        },
      },
    });

    expect(wrapper.get('.haiku').text()).toBe(
      (fr.notFound as { haiku: string[] }).haiku.join(' / '),
    );
  });
});
