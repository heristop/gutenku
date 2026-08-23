import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const MEASUREMENT_ID = 'G-TEST12345';

async function loadProvider(options: { native?: boolean } = {}) {
  vi.doMock('@/utils/capacitor', () => ({ isNative: options.native ?? false }));

  return import('@/services/analytics/ga');
}

describe('ga provider', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', MEASUREMENT_ID);
    // The mode decides availability now, so an ambient Umami config in .env
    // would take GA off the page and fail these cases for the wrong reason.
    vi.stubEnv('VITE_UMAMI_SRC', '');
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', '');
    document.head.innerHTML = '';
    delete (globalThis as { dataLayer?: unknown[] }).dataLayer;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('injects the gtag script exactly once', async () => {
    const { gaProvider } = await loadProvider();

    gaProvider.load();
    gaProvider.load();

    const tags = document.querySelectorAll(
      'script[src*="googletagmanager.com/gtag/js"]',
    );

    expect(tags).toHaveLength(1);
    expect(tags[0].getAttribute('src')).toContain(MEASUREMENT_ID);
  });

  it('configures gtag without an automatic page_view', async () => {
    const { gaProvider } = await loadProvider();

    gaProvider.load();

    const calls = (globalThis as unknown as { dataLayer: unknown[][] })
      .dataLayer;
    const config = calls.find((entry) => entry[0] === 'config');

    expect(config?.[1]).toBe(MEASUREMENT_ID);
    expect(config?.[2]).toMatchObject({ send_page_view: false });
  });

  it('pushes gtag commands as `arguments` objects, not arrays', async () => {
    const { gaProvider } = await loadProvider();

    gaProvider.load();
    gaProvider.trackPageView({ path: '/haiku', title: 'Haiku' });

    const calls = (globalThis as unknown as { dataLayer: unknown[] }).dataLayer;

    // gtag.js ignores any dataLayer entry that is not an `arguments` object, so
    // pushing arrays sends nothing while still reading back correctly by index.
    // Assert the shape GTM actually dispatches on.
    expect(calls.length).toBeGreaterThan(0);

    for (const entry of calls) {
      expect(Object.prototype.toString.call(entry)).toBe('[object Arguments]');
    }
  });

  it('sends a page_view with the given path and title', async () => {
    const { gaProvider } = await loadProvider();

    gaProvider.load();
    gaProvider.trackPageView({ path: '/haiku', title: 'Haiku' });

    const calls = (globalThis as unknown as { dataLayer: unknown[][] })
      .dataLayer;
    const view = calls.find(
      (entry) => entry[0] === 'event' && entry[1] === 'page_view',
    );

    expect(view?.[2]).toMatchObject({
      page_path: '/haiku',
      page_title: 'Haiku',
    });
  });

  it('is unavailable and loads nothing without a measurement id', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');

    const { gaProvider } = await loadProvider();

    expect(gaProvider.isAvailable()).toBeFalsy();

    gaProvider.load();

    expect(
      document.querySelectorAll('script[src*="googletagmanager"]'),
    ).toHaveLength(0);
  });

  it('is unavailable inside a native Capacitor build', async () => {
    const { gaProvider } = await loadProvider({ native: true });

    expect(gaProvider.isAvailable()).toBeFalsy();

    gaProvider.load();

    expect(
      document.querySelectorAll('script[src*="googletagmanager"]'),
    ).toHaveLength(0);
  });

  it('drops events when the tag was never loaded', async () => {
    const { gaProvider } = await loadProvider();

    gaProvider.trackEvent('haiku_generated');

    expect((globalThis as { dataLayer?: unknown[] }).dataLayer).toBeUndefined();
  });
});
