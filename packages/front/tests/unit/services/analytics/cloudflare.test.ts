import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const TOKEN = 'abc123def456';

async function loadProvider(options: { native?: boolean } = {}) {
  vi.doMock('@/utils/capacitor', () => ({ isNative: options.native ?? false }));

  return import('@/services/analytics/cloudflare');
}

function beacon(): HTMLScriptElement | null {
  return document.querySelector<HTMLScriptElement>('script#cf-beacon');
}

describe('cloudflare provider', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', TOKEN);
    vi.stubEnv('VITE_UMAMI_SRC', '');
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', '');
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('injects the beacon once, with the token in its JSON attribute', async () => {
    const { cloudflareProvider } = await loadProvider();

    cloudflareProvider.load();
    cloudflareProvider.load();

    expect(document.querySelectorAll('script#cf-beacon')).toHaveLength(1);
    expect(beacon()?.src).toContain('static.cloudflareinsights.com');
    // A JSON attribute, not a plain one: the quoting is what the beacon reads.
    expect(beacon()?.dataset.cfBeacon).toBe(`{"token":"${TOKEN}"}`);
  });

  it('is unavailable, and loads nothing, without a token', async () => {
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', '');

    const { cloudflareProvider } = await loadProvider();

    expect(cloudflareProvider.isAvailable()).toBeFalsy();

    cloudflareProvider.load();

    expect(beacon()).toBeNull();
  });

  it('is unavailable inside a native Capacitor build', async () => {
    const { cloudflareProvider } = await loadProvider({ native: true });

    expect(cloudflareProvider.isAvailable()).toBeFalsy();

    cloudflareProvider.load();

    expect(beacon()).toBeNull();
  });

  it('stands down when Umami is the one configured', async () => {
    vi.stubEnv('VITE_UMAMI_SRC', 'https://stats.example.test/script.js');
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', 'umami-id');

    const { cloudflareProvider } = await loadProvider();

    // Umami ranks ahead; a beacon loading anyway would measure the same visit
    // twice, which is what the precedence exists to prevent.
    expect(cloudflareProvider.isAvailable()).toBeFalsy();

    cloudflareProvider.load();

    expect(beacon()).toBeNull();
  });

  it('reports nothing itself, rather than reaching for another vendor', async () => {
    const scope = globalThis as { umami?: unknown; gtag?: unknown };
    const previous = { umami: scope.umami, gtag: scope.gtag };
    let reached = false;

    scope.umami = {
      track: () => {
        reached = true;
      },
    };
    scope.gtag = () => {
      reached = true;
    };

    try {
      const { cloudflareProvider } = await loadProvider();

      cloudflareProvider.load();
      // The vendor exposes no way to report either, so both are no-ops. What
      // this pins is that they do not fall through onto whatever global another
      // tag happens to have installed.
      cloudflareProvider.trackPageView({ path: '/haiku' });
      cloudflareProvider.trackEvent('haiku_generated');
    } finally {
      scope.umami = previous.umami;
      scope.gtag = previous.gtag;
    }

    expect(reached).toBeFalsy();
  });
});
