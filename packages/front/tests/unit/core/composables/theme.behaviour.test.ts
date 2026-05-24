import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let capturedOnChanged:
  | ((mode: string, defaultHandler: (m: string) => void) => void)
  | undefined;
let colorModeState: {
  value: string;
  store: { value: string };
  system: { value: string };
};

vi.mock('@vueuse/core', () => ({
  useColorMode: vi.fn((opts: { onChanged?: typeof capturedOnChanged }) => {
    capturedOnChanged = opts.onChanged;
    return colorModeState;
  }),
}));

describe('useTheme (color mode behaviour)', () => {
  beforeEach(() => {
    vi.resetModules();
    capturedOnChanged = undefined;
    colorModeState = {
      value: 'light',
      store: { value: 'light' },
      system: { value: 'light' },
    };
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reflects dark mode and system state from color mode', async () => {
    colorModeState.value = 'dark';
    colorModeState.store.value = 'auto';
    colorModeState.system.value = 'dark';

    const { useTheme } = await import('@/core/composables/theme');
    const t = useTheme();

    expect(t.isDarkMode.value).toBeTruthy();
    expect(t.actualTheme.value).toBe('dark');
    expect(t.themePreference.value).toBe('auto');
    expect(t.isSystemDark.value).toBeTruthy();
    expect(t.systemPreferenceEnabled.value).toBeTruthy();
  });

  it('toggleTheme flips between light and dark', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const t = useTheme();

    t.toggleTheme();
    expect(colorModeState.value).toBe('dark');
  });

  it('setTheme writes the requested preference', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const { setTheme } = useTheme();

    setTheme('auto');
    expect(colorModeState.value).toBe('auto');
  });

  it('saveSystemPreferenceEnabled(true) switches to auto and persists', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const { saveSystemPreferenceEnabled } = useTheme();

    saveSystemPreferenceEnabled(true);

    expect(colorModeState.value).toBe('auto');
    expect(localStorage.getItem('gutenku-system-preference-enabled')).toBe(
      'true',
    );
  });

  it('onChanged uses the default handler on the first (initial) change', async () => {
    await import('@/core/composables/theme');
    const { useTheme } = await import('@/core/composables/theme');
    useTheme(); // instantiates colorMode and registers onChanged

    const defaultHandler = vi.fn();
    capturedOnChanged?.('dark', defaultHandler);

    expect(defaultHandler).toHaveBeenCalledWith('dark');
  });

  it('onChanged uses a view transition when supported on later changes', async () => {
    const start = vi.fn((cb: () => void) => cb());
    (document as unknown as Record<string, unknown>).startViewTransition =
      start;
    vi.spyOn(globalThis, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);

    const { useTheme } = await import('@/core/composables/theme');
    useTheme();

    const defaultHandler = vi.fn();
    // first change initializes
    capturedOnChanged?.('dark', defaultHandler);
    // second change should route through the view transition
    capturedOnChanged?.('light', defaultHandler);

    expect(start).toHaveBeenCalled();
    expect(defaultHandler).toHaveBeenCalledWith('light');

    delete (document as unknown as Record<string, unknown>).startViewTransition;
  });

  it('returns inert SSR fallbacks when running on the server', async () => {
    vi.stubEnv('SSR', true);

    const { useTheme } = await import('@/core/composables/theme');
    const t = useTheme();

    expect(t.isDarkMode.value).toBeFalsy();
    expect(t.themePreference.value).toBe('light');
    expect(t.actualTheme.value).toBe('light');
    expect(t.isSystemDark.value).toBeFalsy();
    expect(t.systemPreferenceEnabled.value).toBeFalsy();
    expect(() => t.toggleTheme()).not.toThrow();
    expect(() => t.setTheme('dark')).not.toThrow();
    expect(() => t.saveSystemPreferenceEnabled(true)).not.toThrow();

    vi.unstubAllEnvs();
  });

  it('onChanged applies a CSS transition when view transitions are unsupported', async () => {
    const setProperty = vi.spyOn(document.documentElement.style, 'setProperty');

    const { useTheme } = await import('@/core/composables/theme');
    useTheme();

    const defaultHandler = vi.fn();
    capturedOnChanged?.('dark', defaultHandler); // initial
    capturedOnChanged?.('light', defaultHandler); // applies CSS transition

    expect(defaultHandler).toHaveBeenCalledWith('light');
    expect(setProperty).toHaveBeenCalledWith(
      '--theme-transition',
      expect.stringContaining('cubic-bezier'),
    );
  });
});
