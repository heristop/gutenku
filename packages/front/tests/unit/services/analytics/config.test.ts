import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const SCRIPT_SRC = 'https://stats.example.test/script.js';
const WEBSITE_ID = '0d1e2f34-5678-49ab-cdef-0123456789ab';
const MEASUREMENT_ID = 'G-TEST12345';

async function loadConfig(options: { native?: boolean } = {}) {
  vi.doMock('@/utils/capacitor', () => ({ isNative: options.native ?? false }));

  return import('@/services/analytics/config');
}

describe('analytics config', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');
    vi.stubEnv('VITE_UMAMI_SRC', '');
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', '');
    vi.stubEnv('VITE_UMAMI_HOST_URL', '');
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to no analytics when nothing is configured', async () => {
    const { resolveAnalyticsMode, isConsentRequired } = await loadConfig();

    expect(resolveAnalyticsMode()).toBe('none');
    expect(isConsentRequired()).toBeFalsy();
  });

  it('asks for consent under GA', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', MEASUREMENT_ID);

    const { resolveAnalyticsMode, isConsentRequired } = await loadConfig();

    expect(resolveAnalyticsMode()).toBe('ga');
    expect(isConsentRequired()).toBeTruthy();
  });

  it('asks for nothing under Umami, which sets no cookie', async () => {
    vi.stubEnv('VITE_UMAMI_SRC', SCRIPT_SRC);
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', WEBSITE_ID);

    const { resolveAnalyticsMode, isConsentRequired } = await loadConfig();

    expect(resolveAnalyticsMode()).toBe('umami');
    expect(isConsentRequired()).toBeFalsy();
  });

  it('lets Umami win over a GA id left behind by the migration', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', MEASUREMENT_ID);
    vi.stubEnv('VITE_UMAMI_SRC', SCRIPT_SRC);
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', WEBSITE_ID);

    const { resolveAnalyticsMode } = await loadConfig();

    // Measuring twice is worse than measuring once — and it would keep the
    // cookie banner alive on a site that no longer needs one.
    expect(resolveAnalyticsMode()).toBe('umami');
  });

  it('ignores a half-configured Umami and stays on GA', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', MEASUREMENT_ID);
    vi.stubEnv('VITE_UMAMI_SRC', SCRIPT_SRC);

    const { resolveAnalyticsMode, getUmamiConfig } = await loadConfig();

    expect(getUmamiConfig()).toBeUndefined();
    expect(resolveAnalyticsMode()).toBe('ga');
  });

  it('treats blank-only values as unset', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '   ');

    const { resolveAnalyticsMode } = await loadConfig();

    expect(resolveAnalyticsMode()).toBe('none');
  });

  it('reports whether anything is configured at all', async () => {
    const unconfigured = await loadConfig();

    expect(unconfigured.isAnalyticsEnabled()).toBeFalsy();

    vi.resetModules();
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', MEASUREMENT_ID);

    const configured = await loadConfig();

    expect(configured.isAnalyticsEnabled()).toBeTruthy();
  });

  it('keeps the mode a build-time answer the platform cannot change', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', MEASUREMENT_ID);

    const { resolveAnalyticsMode, canHostTag } = await loadConfig({
      native: true,
    });

    // `cap:build` ships the very dist vite-ssg prerendered in Node. A mode that
    // answered differently on the device would prerender the footer's cookie
    // control and then hydrate without it.
    expect(resolveAnalyticsMode()).toBe('ga');
    // The tag is kept out of native builds here instead, where the providers
    // read it — nothing the prerendered markup depends on.
    expect(canHostTag()).toBeFalsy();
  });

  it('hosts a tag in a browser', async () => {
    const { canHostTag } = await loadConfig();

    expect(canHostTag()).toBeTruthy();
  });
});

describe('Cloudflare Web Analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');
    vi.stubEnv('VITE_UMAMI_SRC', '');
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', '');
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('runs on a token alone, and removes the banner with it', async () => {
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', 'abc123');

    const { resolveAnalyticsMode, isConsentRequired } = await loadConfig();

    expect(resolveAnalyticsMode()).toBe('cloudflare');
    // Cookieless: nothing is written on the device, so the banner would be a
    // question about nothing.
    expect(isConsentRequired()).toBeFalsy();
  });

  it('ranks behind Umami and ahead of GA', async () => {
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', 'abc123');
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', MEASUREMENT_ID);

    const overGa = await loadConfig();

    expect(overGa.resolveAnalyticsMode()).toBe('cloudflare');

    vi.resetModules();
    vi.stubEnv('VITE_UMAMI_SRC', SCRIPT_SRC);
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', WEBSITE_ID);

    const umamiFirst = await loadConfig();

    expect(umamiFirst.resolveAnalyticsMode()).toBe('umami');
  });

  it('treats a blank-only token as unset', async () => {
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', '   ');
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', MEASUREMENT_ID);

    const { resolveAnalyticsMode } = await loadConfig();

    expect(resolveAnalyticsMode()).toBe('ga');
  });
});
