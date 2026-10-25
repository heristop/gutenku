import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import InkLanguageMenu from '@/core/components/ui/InkLanguageMenu.vue';

const localeRef = ref('en');
const setLocaleSpy = vi.fn();

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: localeRef }),
}));

vi.mock('@/core/composables/locale', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/core/composables/locale')>();

  return {
    ...actual,
    useLocale: () => {
      const api = actual.useLocale();

      return {
        ...api,
        setLocale: (value: Parameters<typeof api.setLocale>[0]) => {
          setLocaleSpy(value);
          api.setLocale(value);
        },
      };
    },
  };
});

let wrapper: VueWrapper;

const listbox = () =>
  document.querySelector<HTMLUListElement>('[role="listbox"]');
const options = () => [
  ...document.querySelectorAll<HTMLLIElement>('[role="option"]'),
];
const activeOption = () => {
  const id = listbox()?.getAttribute('aria-activedescendant');

  return id ? document.getElementById(id) : null;
};
const key = async (target: Element, k: string) => {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
  );
  await nextTick();
  await nextTick();
};

describe('InkLanguageMenu', () => {
  beforeEach(() => {
    localeRef.value = 'en';
    setLocaleSpy.mockClear();
    localStorage.clear();
    wrapper = mount(InkLanguageMenu, {
      attachTo: document.body,
      global: { stubs: { teleport: false, transition: true } },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    document.body.innerHTML = '';
  });

  it('renders a labelled listbox trigger showing the current code', () => {
    const trigger = wrapper.get('button');

    expect(trigger.text()).toBe('EN');
    expect(trigger.attributes('aria-haspopup')).toBe('listbox');
    expect(trigger.attributes('aria-expanded')).toBe('false');
    expect(trigger.attributes('aria-label')).toContain('locale.switch');
    expect(listbox()).toBeNull();
  });

  it('opens on click with every supported language in its own name', async () => {
    const trigger = wrapper.get('button');
    await trigger.trigger('click');
    await nextTick();

    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(trigger.attributes('aria-controls')).toBe(listbox()?.id);
    expect(options().map((o) => o.textContent?.trim())).toEqual([
      'English',
      'Français',
      '日本語',
    ]);
    expect(options().map((o) => o.getAttribute('lang'))).toEqual([
      'en',
      'fr',
      'ja',
    ]);
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(listbox());
    expect(activeOption()).toBe(options()[0]);
  });

  it('opens on ArrowDown with the current language active', async () => {
    localeRef.value = 'fr';
    await nextTick();
    await key(wrapper.get('button').element, 'ArrowDown');

    expect(listbox()).not.toBeNull();
    expect(activeOption()?.textContent?.trim()).toBe('Français');
  });

  it('navigates with arrows, Home, End and typeahead', async () => {
    await key(wrapper.get('button').element, 'Enter');
    const list = listbox()!;

    await key(list, 'ArrowDown');
    expect(activeOption()).toBe(options()[1]);
    await key(list, 'End');
    expect(activeOption()).toBe(options()[2]);
    await key(list, 'ArrowDown');
    expect(activeOption()).toBe(options()[2]);
    await key(list, 'Home');
    expect(activeOption()).toBe(options()[0]);
    await key(list, 'ArrowUp');
    expect(activeOption()).toBe(options()[0]);
    await key(list, 'f');
    expect(activeOption()).toBe(options()[1]);
    await key(list, 'j');
    expect(activeOption()).toBe(options()[2]);
  });

  it('selects with Enter, switching the locale and closing', async () => {
    const trigger = wrapper.get('button');
    await key(trigger.element, ' ');
    await key(listbox()!, 'ArrowDown');
    await key(listbox()!, 'Enter');

    expect(setLocaleSpy).toHaveBeenCalledWith('fr');
    expect(localeRef.value).toBe('fr');
    expect(localStorage.setItem).toHaveBeenCalledWith('gutenku-locale', 'fr');
    expect(document.documentElement.lang).toBe('fr');
    expect(trigger.attributes('aria-expanded')).toBe('false');
    expect(trigger.text()).toBe('FR');
    expect(document.activeElement).toBe(trigger.element);
  });

  it('selects on option click', async () => {
    await wrapper.get('button').trigger('click');
    await nextTick();
    options()[2].click();
    await nextTick();

    expect(setLocaleSpy).toHaveBeenCalledWith('ja');
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false');
  });

  it('does not re-set the locale when choosing the current one', async () => {
    await key(wrapper.get('button').element, 'Enter');
    await key(listbox()!, 'Enter');

    expect(setLocaleSpy).not.toHaveBeenCalled();
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const trigger = wrapper.get('button');
    await key(trigger.element, 'ArrowDown');
    expect(document.activeElement).toBe(listbox());

    await key(listbox()!, 'Escape');

    expect(trigger.attributes('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger.element);
    expect(setLocaleSpy).not.toHaveBeenCalled();
  });

  it('closes on Tab', async () => {
    await key(wrapper.get('button').element, 'ArrowDown');
    await key(listbox()!, 'Tab');

    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false');
  });

  it('closes on a pointer press outside, but not inside the leaf', async () => {
    await wrapper.get('button').trigger('click');
    await nextTick();

    listbox()!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await nextTick();
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true');

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await nextTick();
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false');
  });

  it('toggles closed when the trigger is clicked again', async () => {
    const trigger = wrapper.get('button');
    await trigger.trigger('click');
    await nextTick();
    await trigger.trigger('click');

    expect(trigger.attributes('aria-expanded')).toBe('false');
  });
});
