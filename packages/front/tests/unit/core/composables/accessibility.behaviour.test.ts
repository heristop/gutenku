import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { withSetup } from '../../helpers/with-setup';

// Mock the dynamically imported font asset
vi.mock('@/assets/fonts/OpenDyslexic-Regular.woff2', () => ({
  default: 'data:font/woff2;base64,AAAA',
}));

async function flush() {
  await nextTick();
  // The composable awaits a dynamic import() which settles on a macrotask,
  // so flush both micro- and macrotask queues generously.
  for (let i = 0; i < 8; i++) {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }
}

/** Wait until the predicate holds, flushing micro/macrotasks between checks. */
async function waitUntil(predicate: () => boolean, attempts = 50) {
  for (let i = 0; i < attempts; i++) {
    if (predicate()) {
      return;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }
}

function dyslexiaAttr() {
  return document.documentElement.getAttribute('data-dyslexia');
}

describe('useAccessibility (apply behaviour)', () => {
  const fontLoad = vi.fn().mockResolvedValue();
  const fontAdd = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.removeAttribute('data-dyslexia');

    (globalThis as Record<string, unknown>).FontFace = vi
      .fn()
      .mockImplementation(() => ({ load: fontLoad }));
    Object.defineProperty(document, 'fonts', {
      value: { add: fontAdd, ready: Promise.resolve() },
      configurable: true,
    });
    fontLoad.mockClear();
    fontAdd.mockClear();
    fontLoad.mockResolvedValue();
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).FontFace;
  });

  it('applies the data-dyslexia attribute, persists, and lazy-loads the font', async () => {
    const { useAccessibility } =
      await import('@/core/composables/accessibility');

    const { result, unmount } = withSetup(() => useAccessibility());
    await flush(); // let the initial (disabled) effect settle first
    result.setDyslexia(true);
    await waitUntil(() => dyslexiaAttr() === 'true');

    expect(dyslexiaAttr()).toBe('true');
    expect(localStorage.getItem('gutenku-dyslexia-enabled')).toBe('true');
    expect(globalThis.FontFace).toHaveBeenCalled();
    unmount();
  });

  it('removes dyslexia styling when disabled', async () => {
    const { useAccessibility } =
      await import('@/core/composables/accessibility');

    const { result, unmount } = withSetup(() => useAccessibility());
    await flush();
    result.setDyslexia(true);
    await waitUntil(() => dyslexiaAttr() === 'true');
    expect(dyslexiaAttr()).toBe('true');

    result.setDyslexia(false);
    await waitUntil(() => dyslexiaAttr() === 'false');

    expect(dyslexiaAttr()).toBe('false');
    expect(localStorage.getItem('gutenku-dyslexia-enabled')).toBe('false');
    unmount();
  });

  it('toggles dyslexia state via toggleDyslexia', async () => {
    const { useAccessibility } =
      await import('@/core/composables/accessibility');

    const { result, unmount } = withSetup(() => useAccessibility());
    await flush();
    expect(result.dyslexiaEnabled.value).toBeFalsy();

    result.toggleDyslexia();
    await waitUntil(() => dyslexiaAttr() === 'true');
    expect(result.dyslexiaEnabled.value).toBeTruthy();
    expect(dyslexiaAttr()).toBe('true');
    unmount();
  });

  it('initializes from a persisted preference', async () => {
    localStorage.setItem('gutenku-dyslexia-enabled', 'true');
    const { useAccessibility } =
      await import('@/core/composables/accessibility');

    const { result, unmount } = withSetup(() => useAccessibility());
    expect(result.dyslexiaEnabled.value).toBeTruthy();
    unmount();
  });

  it('returns inert no-ops under SSR', async () => {
    vi.stubEnv('SSR', true);
    const { useAccessibility } =
      await import('@/core/composables/accessibility');

    const { result, unmount } = withSetup(() => useAccessibility());
    expect(result.dyslexiaEnabled.value).toBeFalsy();
    expect(() => result.toggleDyslexia()).not.toThrow();
    expect(() => result.setDyslexia(true)).not.toThrow();
    unmount();
    vi.unstubAllEnvs();
  });

  it('handles font loading failures silently while still applying the attribute', async () => {
    fontLoad.mockRejectedValue(new Error('font failed'));
    const { useAccessibility } =
      await import('@/core/composables/accessibility');

    const { result, unmount } = withSetup(() => useAccessibility());
    await flush();
    expect(() => result.setDyslexia(true)).not.toThrow();
    await waitUntil(() => dyslexiaAttr() === 'true');

    expect(dyslexiaAttr()).toBe('true');
    unmount();
  });
});
