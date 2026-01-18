import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @vueuse/core useColorMode
vi.mock('@vueuse/core', () => ({
  useColorMode: vi.fn(() => ({
    value: 'light',
    store: { value: 'light' },
    system: { value: 'light' },
  })),
}));

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should expose theme properties', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const theme = useTheme();

    expect(theme.isDarkMode).toBeDefined();
    expect(theme.themePreference).toBeDefined();
    expect(theme.actualTheme).toBeDefined();
    expect(theme.isSystemDark).toBeDefined();
    expect(theme.systemPreferenceEnabled).toBeDefined();
  });

  it('should expose theme functions', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const theme = useTheme();

    expect(typeof theme.toggleTheme).toBe('function');
    expect(typeof theme.setTheme).toBe('function');
    expect(typeof theme.saveSystemPreferenceEnabled).toBe('function');
  });

  it('should return computed isDarkMode', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const { isDarkMode } = useTheme();

    expect(typeof isDarkMode.value).toBe('boolean');
  });

  it('should return computed themePreference', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const { themePreference } = useTheme();

    expect(['light', 'dark', 'auto']).toContain(themePreference.value);
  });

  it('should return computed actualTheme', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const { actualTheme } = useTheme();

    expect(['light', 'dark']).toContain(actualTheme.value);
  });

  it('should expose systemPreferenceEnabled', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const { systemPreferenceEnabled } = useTheme();

    expect(typeof systemPreferenceEnabled.value).toBe('boolean');
  });

  it('should have toggleTheme as a callable function', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const { toggleTheme } = useTheme();

    expect(() => toggleTheme()).not.toThrow();
  });

  it('should have setTheme as a callable function', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const { setTheme } = useTheme();

    expect(() => setTheme('dark')).not.toThrow();
    expect(() => setTheme('light')).not.toThrow();
    expect(() => setTheme('auto')).not.toThrow();
  });

  it('should save system preference to localStorage', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const { saveSystemPreferenceEnabled } = useTheme();

    saveSystemPreferenceEnabled(true);

    expect(localStorage.getItem('gutenku-system-preference-enabled')).toBe(
      'true',
    );
  });

  it('should save disabled system preference to localStorage', async () => {
    const { useTheme } = await import('@/core/composables/theme');
    const { saveSystemPreferenceEnabled } = useTheme();

    saveSystemPreferenceEnabled(false);

    expect(localStorage.getItem('gutenku-system-preference-enabled')).toBe(
      'false',
    );
  });
});
