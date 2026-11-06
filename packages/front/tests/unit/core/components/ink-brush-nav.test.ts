import { describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import InkBrushNav from '@/core/components/ui/InkBrushNav.vue';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock('@/features/game/config', () => ({ GAME_ENABLED: true }));

describe('main navigation', () => {
  it('highlights the library and lets the reader return to the game', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: ['/', '/game', '/game/journal', '/haiku', '/blog'].map(
        (path) => ({ path, component: { template: '<div />' } }),
      ),
    });
    await router.push('/game/journal');
    await router.isReady();
    const wrapper = mount(InkBrushNav, {
      global: { plugins: [router], stubs: { BrandMark: true, InkPrefs: true } },
    });
    const link = wrapper.get('.ink-nav__item[href="/game"]');
    expect(link.attributes('aria-current')).toBeUndefined();
    expect(
      wrapper
        .get('.ink-nav__item[href="/game/journal"]')
        .attributes('aria-current'),
    ).toBe('page');
    await link.trigger('click', { button: 0 });
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/game');
    wrapper.unmount();
  });
});
