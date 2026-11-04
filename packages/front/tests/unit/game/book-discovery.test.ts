import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { gameEnabled } from './game-enabled';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: () => 'Dans les coulisses du livre' }),
}));

describe.runIf(gameEnabled)('BookDiscovery', () => {
  let intersect: IntersectionObserverCallback;
  const disconnect = vi.fn();
  const observe = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          intersect = callback;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  async function render(props: { anecdote?: string; active?: boolean } = {}) {
    const component = (
      await import('@/features/game/components/BookDiscovery.vue')
    ).default;
    const wrapper = mount(component, { props });
    await nextTick();

    return wrapper;
  }

  function visibility(ratio: number) {
    intersect(
      [
        {
          isIntersecting: ratio > 0,
          intersectionRatio: ratio,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );
  }

  it('keeps old results without an anecdote free of empty headings', async () => {
    const wrapper = await render();
    expect(wrapper.find('section').exists()).toBeFalsy();
    expect(observe).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('renders the anecdote as text, with a labelled section', async () => {
    const wrapper = await render({
      anecdote: '<strong>The first manuscript</strong>',
    });
    expect(wrapper.get('section').attributes('aria-labelledby')).toBe(
      wrapper.get('h3').attributes('id'),
    );
    expect(wrapper.get('p').text()).toContain('<strong>');
    expect(wrapper.find('strong').exists()).toBeFalsy();
    wrapper.unmount();
  });

  it('reports only after half the content enters the viewport, once', async () => {
    const wrapper = await render({ anecdote: 'Alice began on a boat trip.' });
    expect(wrapper.emitted('viewed')).toBeUndefined();
    visibility(0.2);
    expect(wrapper.emitted('viewed')).toBeUndefined();
    visibility(0.75);
    visibility(1);
    expect(wrapper.emitted('viewed')).toHaveLength(1);
    wrapper.unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it('omits the section when the anecdote is blank and labels available content', async () => {
    const wrapper = await render({ anecdote: 'Alice began on a boat trip.' });
    expect(wrapper.get('h3').text()).toBe('Dans les coulisses du livre');
    expect(wrapper.get('p').text()).toBe('Alice began on a boat trip.');
    await wrapper.setProps({ anecdote: '  ' });
    expect(wrapper.find('section').exists()).toBeFalsy();
    wrapper.unmount();
  });

  it('does not measure a hidden result or the page behind a modal', async () => {
    const wrapper = await render({
      anecdote: 'Alice began on a boat trip.',
      active: false,
    });
    expect(observe).not.toHaveBeenCalled();
    await wrapper.setProps({ active: true });
    visibility(1);
    expect(wrapper.emitted('viewed')).toHaveLength(1);
    await wrapper.setProps({ active: false });
    visibility(1);
    expect(wrapper.emitted('viewed')).toHaveLength(1);
    wrapper.unmount();
  });

  it('keeps content readable when visibility measurement is unavailable', async () => {
    // Simulate a browser without this optional measurement API.
    Reflect.deleteProperty(globalThis, 'IntersectionObserver');
    const wrapper = await render({ anecdote: 'Alice began on a boat trip.' });
    expect(wrapper.get('p').text()).toBe('Alice began on a boat trip.');
    expect(wrapper.emitted('viewed')).toBeUndefined();
    wrapper.unmount();
  });
});
