import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { createSSRApp, defineComponent, h, nextTick } from 'vue';
import { renderToString } from 'vue/server-renderer';
import ZenSelect from '@/core/components/ui/ZenSelect.vue';

const wrappers: VueWrapper[] = [];
const originalViewport = {
  width: globalThis.innerWidth,
  height: globalThis.innerHeight,
};
const choices = [
  { value: 'custom', label: 'My arrangement' },
  { value: 'recent', label: 'Recently found', disabled: true },
  { value: 'title', label: 'Book title' },
  { value: 'author', label: 'Author name' },
];

function mountSelect(props = {}) {
  const wrapper = mount(ZenSelect, {
    props: {
      modelValue: 'custom',
      options: choices,
      ariaLabel: 'Sort books',
      ...props,
    },
    attrs: { 'data-cy': 'library-sort', 'aria-describedby': 'sort-help' },
    attachTo: document.body,
    global: { stubs: { teleport: false, transition: true } },
  });
  wrappers.push(wrapper);

  return wrapper;
}

const options = () => [
  ...document.querySelectorAll<HTMLElement>('[role="option"]'),
];
const popup = () => document.querySelector<HTMLElement>('[role="listbox"]');
const activeOption = (trigger: Element) =>
  document.getElementById(trigger.getAttribute('aria-activedescendant') || '');

async function press(trigger: Element, key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  trigger.dispatchEvent(event);
  await nextTick();
  await nextTick();

  return event;
}

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  document.body.replaceChildren();
  vi.restoreAllMocks();
  Object.defineProperties(globalThis, {
    innerWidth: { configurable: true, value: originalViewport.width },
    innerHeight: { configurable: true, value: originalViewport.height },
  });
});

describe('ZenSelect', () => {
  it('shows object labels while emitting their stable values and forwarding trigger attributes', async () => {
    const wrapper = mountSelect();
    const trigger = wrapper.get('[role="combobox"]');
    expect(trigger.text()).toBe('My arrangement');
    expect(trigger.attributes('aria-label')).toBe('Sort books');
    expect(trigger.attributes('data-cy')).toBe('library-sort');
    expect(trigger.attributes('aria-describedby')).toBe('sort-help');
    expect(wrapper.find('.zen-select__label').exists()).toBeFalsy();

    await trigger.trigger('click');
    expect(document.body.contains(popup())).toBeTruthy();
    expect(wrapper.element.contains(popup())).toBeFalsy();
    expect(options().map((option) => option.textContent?.trim())).toEqual([
      'My arrangement',
      'Recently found',
      'Book title',
      'Author name',
    ]);
    expect(options()[2].dataset.value).toBe('title');
    options()[2].click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toEqual([['title']]);
    expect(popup()).toBeNull();
    await wrapper.setProps({ modelValue: 'author' });
    expect(trigger.text()).toBe('Author name');
  });

  it('preserves legacy flat and grouped strings, labels, icons, and AI theme badges', async () => {
    const wrapper = mount(ZenSelect, {
      props: {
        modelValue: 'quiet forest',
        label: 'Theme',
        options: ['quiet forest', 'night sky'],
        aiThemes: ['quiet forest'],
      },
      slots: { icon: '<span>Ink</span>' },
      global: { stubs: { teleport: false, transition: true } },
    });
    wrappers.push(wrapper);
    expect(wrapper.get('.zen-select__label').text()).toBe('Theme');
    expect(wrapper.get('.zen-select__icon').text()).toBe('Ink');
    expect(
      wrapper.find('.zen-select__value .zen-select__ai-badge').exists(),
    ).toBeTruthy();
    await wrapper.setProps({
      options: [{ group: 'Nature', options: ['quiet forest', 'night sky'] }],
    });
    await wrapper.get('button').trigger('click');
    expect(popup()?.textContent).toContain('Nature');
    options()[1].click();
    expect(wrapper.emitted('update:modelValue')).toEqual([['night sky']]);
  });

  it('keeps focus on the trigger and skips disabled options with arrows, Home, and End', async () => {
    const wrapper = mountSelect();
    const trigger = wrapper.get<HTMLButtonElement>('button').element;
    trigger.focus();
    await press(trigger, 'ArrowUp');
    expect(popup()).not.toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(activeOption(trigger)?.dataset.value).toBe('custom');
    await press(trigger, 'ArrowDown');
    expect(activeOption(trigger)?.dataset.value).toBe('title');
    await press(trigger, 'End');
    expect(activeOption(trigger)?.dataset.value).toBe('author');
    await press(trigger, 'ArrowDown');
    expect(activeOption(trigger)?.dataset.value).toBe('author');
    await press(trigger, 'Home');
    expect(activeOption(trigger)?.dataset.value).toBe('custom');
    await press(trigger, 'ArrowUp');
    expect(activeOption(trigger)?.dataset.value).toBe('custom');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    await press(trigger, ' ');
    expect(wrapper.emitted('update:modelValue')).toEqual([['custom']]);
    expect(popup()).toBeNull();
  });

  it('opens ArrowUp at the last enabled option when no value is selected', async () => {
    const wrapper = mountSelect({ modelValue: '' });
    const trigger = wrapper.get('button').element;
    await press(trigger, 'ArrowUp');
    expect(activeOption(trigger)?.dataset.value).toBe('author');
    await press(trigger, 'Enter');
    expect(wrapper.emitted('update:modelValue')).toEqual([['author']]);
  });

  it('supports case-insensitive prefix typing and repeated-letter cycling without choosing disabled entries', async () => {
    const wrapper = mountSelect({
      options: [
        { value: 'a', label: 'All books' },
        { value: 'skip', label: 'Books disabled', disabled: true },
        { value: 'b', label: 'Book title' },
        { value: 'c', label: 'Best authors' },
      ],
      modelValue: 'a',
    });
    const trigger = wrapper.get('button').element;
    await press(trigger, 'B');
    expect(activeOption(trigger)?.dataset.value).toBe('b');
    await press(trigger, 'b');
    expect(activeOption(trigger)?.dataset.value).toBe('c');
    await press(trigger, 'o');
    expect(activeOption(trigger)?.dataset.value).toBe('b');
    await press(trigger, 'Enter');
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']]);
  });

  it('does not choose disabled entries or let pointer presses steal trigger focus', async () => {
    const wrapper = mountSelect();
    const trigger = wrapper.get<HTMLButtonElement>('button').element;
    trigger.focus();
    await press(trigger, 'Enter');
    expect(options()[1].getAttribute('aria-disabled')).toBe('true');
    options()[1].click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(popup()).not.toBeNull();
    const pointer = new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    });
    options()[2].dispatchEvent(pointer);
    expect(pointer.defaultPrevented).toBeTruthy();
    expect(document.activeElement).toBe(trigger);
    options()[2].click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toEqual([['title']]);
  });

  it('cancels without choosing on Escape, Tab, blur, and an outside click', async () => {
    const wrapper = mountSelect();
    const trigger = wrapper.get('button');

    for (const close of [
      () => press(trigger.element, 'Escape'),
      () => press(trigger.element, 'Tab'),
      () => trigger.trigger('blur'),
      async () => {
        document.body.click();
        await nextTick();
      },
    ]) {
      await trigger.trigger('click');
      await press(trigger.element, 'End');
      await close();
      expect(trigger.attributes('aria-expanded')).toBe('false');
      expect(trigger.attributes('aria-activedescendant')).toBeUndefined();
      expect(popup()).toBeNull();
    }
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('closes when it becomes unavailable and handles empty or entirely disabled lists', async () => {
    const wrapper = mountSelect();
    const trigger = wrapper.get('button');
    await trigger.trigger('click');
    await wrapper.setProps({ loading: true });
    expect(popup()).toBeNull();
    await press(trigger.element, 'Enter');
    expect(popup()).toBeNull();
    await wrapper.setProps({ loading: false, disabled: true });
    await trigger.trigger('click');
    expect(popup()).toBeNull();
    await wrapper.setProps({ disabled: false, options: [] });
    await press(trigger.element, 'ArrowDown');
    await press(trigger.element, 'Enter');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    await wrapper.setProps({
      options: [{ value: 'off', label: 'Unavailable', disabled: true }],
    });
    await press(trigger.element, 'Home');
    await press(trigger.element, 'Enter');
    expect(trigger.attributes('aria-activedescendant')).toBeUndefined();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('keeps the trigger focusable through loading without accepting another selection', async () => {
    const wrapper = mountSelect();
    const trigger = wrapper.get<HTMLButtonElement>('button');
    trigger.element.focus();
    await press(trigger.element, 'Enter');
    await press(trigger.element, 'ArrowDown');
    await press(trigger.element, 'Enter');
    expect(wrapper.emitted('update:modelValue')).toEqual([['title']]);

    await wrapper.setProps({ modelValue: 'title', loading: true });
    // Native disabling blurs a focused button in browsers and does not
    // return focus when the loading state clears.
    expect(trigger.element.disabled).toBeFalsy();
    expect(trigger.attributes('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(trigger.element);
    await press(trigger.element, 'Enter');
    await trigger.trigger('click');
    expect(popup()).toBeNull();
    expect(wrapper.emitted('update:modelValue')).toEqual([['title']]);

    await wrapper.setProps({ loading: false });
    expect(document.activeElement).toBe(trigger.element);
    await press(trigger.element, 'ArrowDown');
    expect(popup()).not.toBeNull();
    expect(activeOption(trigger.element)?.dataset.value).toBe('title');
    await wrapper.setProps({ disabled: true });
    expect(trigger.element.disabled).toBeTruthy();
    expect(popup()).toBeNull();
  });

  it('fits a narrow viewport and flips above a trigger near the bottom edge', async () => {
    Object.defineProperties(globalThis, {
      innerWidth: { configurable: true, value: 320 },
      innerHeight: { configurable: true, value: 600 },
    });
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(400);
    const wrapper = mountSelect();
    vi.spyOn(
      wrapper.get('button').element,
      'getBoundingClientRect',
    ).mockReturnValue(new DOMRect(274, 520, 38, 44));
    await wrapper.get('button').trigger('click');
    await nextTick();
    const style = popup()!.style;
    expect(Number.parseFloat(style.width)).toBeGreaterThanOrEqual(180);
    expect(Number.parseFloat(style.left)).toBeGreaterThanOrEqual(8);
    expect(
      Number.parseFloat(style.left) + Number.parseFloat(style.width),
    ).toBeLessThanOrEqual(312);
    expect(Number.parseFloat(style.maxHeight)).toBeGreaterThan(0);
    expect(
      Number.parseFloat(style.top) + Number.parseFloat(style.maxHeight),
    ).toBeLessThanOrEqual(516);
  });

  it('bounds an oversized trigger to the viewport and follows a scrolled anchor', async () => {
    Object.defineProperties(globalThis, {
      innerWidth: { configurable: true, value: 320 },
      innerHeight: { configurable: true, value: 600 },
    });
    const wrapper = mountSelect();
    const rect = vi
      .spyOn(wrapper.get('button').element, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(-20, 20, 600, 44));
    await wrapper.get('button').trigger('click');
    await nextTick();
    expect(popup()!.style.left).toBe('8px');
    expect(popup()!.style.width).toBe('304px');
    expect(popup()!.style.top).toBe('68px');
    rect.mockReturnValue(new DOMRect(20, 100, 200, 44));
    globalThis.dispatchEvent(new Event('scroll'));
    globalThis.dispatchEvent(new Event('resize'));
    await new Promise((resolve) => {
      setTimeout(resolve, 30);
    });
    await nextTick();
    expect(popup()!.style.top).toBe('148px');
    expect(popup()!.style.left).toBe('20px');
  });

  it('uses unique deterministic control ids across server renders and hydration', async () => {
    const Root = defineComponent({
      setup: () => () =>
        h('div', [
          h(ZenSelect, {
            modelValue: 'one',
            options: ['one', 'two'],
            label: 'First',
          }),
          h(ZenSelect, {
            modelValue: 'two',
            options: ['one', 'two'],
            label: 'Second',
          }),
        ]),
    });
    const html = await renderToString(createSSRApp(Root));
    expect(await renderToString(createSSRApp(Root))).toBe(html);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);
    const ids = [...container.querySelectorAll('button')].map((button) =>
      button.getAttribute('aria-controls'),
    );
    expect(new Set(ids).size).toBe(2);
    const app = createSSRApp(Root);
    app.mount(container);
    try {
      expect(
        [...container.querySelectorAll('button')].map((button) =>
          button.getAttribute('aria-controls'),
        ),
      ).toEqual(ids);
    } finally {
      app.unmount();
    }
  });
});
