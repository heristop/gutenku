import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const SCRIPT_SRC = 'https://stats.example.test/script.js';
const WEBSITE_ID = '0d1e2f34-5678-49ab-cdef-0123456789ab';
const CLOUDFLARE_TOKEN = 'abc123';

async function loadConfig(options: { native?: boolean } = {}) {
  vi.doMock('@/utils/capacitor', () => ({ isNative: options.native ?? false }));

  return import('@/services/analytics/config');
}

describe('analytics config', () => {
  beforeEach(() => {
    vi.resetModules();
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

  it('asks for nothing under Umami, which sets no cookie', async () => {
    vi.stubEnv('VITE_UMAMI_SRC', SCRIPT_SRC);
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', WEBSITE_ID);

    const { resolveAnalyticsMode, isConsentRequired } = await loadConfig();

    expect(resolveAnalyticsMode()).toBe('umami');
    expect(isConsentRequired()).toBeFalsy();
  });

  it('never asks for consent: every shipping provider is cookieless', async () => {
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', CLOUDFLARE_TOKEN);

    const { isConsentRequired } = await loadConfig();

    // The banner and the footer control both hang off this one answer, so a
    // provider that needs a cookie is a one-function change, not a rewrite.
    expect(isConsentRequired()).toBeFalsy();
  });

  it('ignores a half-configured Umami', async () => {
    vi.stubEnv('VITE_UMAMI_SRC', SCRIPT_SRC);

    const { resolveAnalyticsMode, getUmamiConfig } = await loadConfig();

    expect(getUmamiConfig()).toBeUndefined();
    expect(resolveAnalyticsMode()).toBe('none');
  });

  it('treats blank-only values as unset', async () => {
    vi.stubEnv('VITE_UMAMI_SRC', '   ');
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', '   ');

    const { resolveAnalyticsMode } = await loadConfig();

    expect(resolveAnalyticsMode()).toBe('none');
  });

  it('reports whether anything is configured at all', async () => {
    const unconfigured = await loadConfig();

    expect(unconfigured.isAnalyticsEnabled()).toBeFalsy();

    vi.resetModules();
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', CLOUDFLARE_TOKEN);

    const configured = await loadConfig();

    expect(configured.isAnalyticsEnabled()).toBeTruthy();
  });

  it('keeps the mode a build-time answer the platform cannot change', async () => {
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', CLOUDFLARE_TOKEN);

    const { resolveAnalyticsMode, canHostTag } = await loadConfig({
      native: true,
    });

    // `cap:build` ships the very dist vite-ssg prerendered in Node. A mode that
    // answered differently on the device would prerender markup the device then
    // hydrates without.
    expect(resolveAnalyticsMode()).toBe('cloudflare');
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
    vi.stubEnv('VITE_UMAMI_SRC', '');
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', '');
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('runs on a token alone, and asks the visitor nothing', async () => {
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', CLOUDFLARE_TOKEN);

    const { resolveAnalyticsMode, isConsentRequired } = await loadConfig();

    expect(resolveAnalyticsMode()).toBe('cloudflare');
    // Cookieless: nothing is written on the device, so the banner would be a
    // question about nothing.
    expect(isConsentRequired()).toBeFalsy();
  });

  it('ranks behind Umami', async () => {
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', CLOUDFLARE_TOKEN);

    const alone = await loadConfig();

    expect(alone.resolveAnalyticsMode()).toBe('cloudflare');

    vi.resetModules();
    vi.stubEnv('VITE_UMAMI_SRC', SCRIPT_SRC);
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', WEBSITE_ID);

    const umamiFirst = await loadConfig();

    // Measuring twice is worse than measuring once.
    expect(umamiFirst.resolveAnalyticsMode()).toBe('umami');
  });

  it('treats a blank-only token as unset', async () => {
    vi.stubEnv('VITE_CLOUDFLARE_TOKEN', '   ');

    const { resolveAnalyticsMode } = await loadConfig();

    expect(resolveAnalyticsMode()).toBe('none');
  });
});
