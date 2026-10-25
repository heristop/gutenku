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

vi.mock('@/features/game/config', () => ({ GAME_ENABLED: true }));

const NotFound = (await import('@/views/NotFound.vue')).default;

const stubs = {
  ZenHaiku: {
    props: ['lines'],
    template: '<p class="haiku">{{ lines.join(" / ") }}</p>',
  },
  ZenButton: true,
  ZenCard: { template: '<div><slot /></div>' },
  BrushRule: true,
  RouterLink: {
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  },
};

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

  it('offers the two other ways in, quietly', () => {
    const wrapper = mount(NotFound, { global: { stubs } });
    const links = wrapper.findAll('.not-found__elsewhere a');

    expect(links.map((link) => link.attributes('href'))).toEqual([
      '/haiku',
      '/game',
    ]);
    expect(links.map((link) => link.text())).toEqual([
      'home.hero.write',
      'home.hero.play',
    ]);
  });
});
