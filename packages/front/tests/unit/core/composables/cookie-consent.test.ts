import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick, watchEffect } from 'vue';

const STORAGE_KEY = 'gutenku-cookie-consent';
const MEASUREMENT_ID = 'G-TEST12345';
const UMAMI_SRC = 'https://stats.example.test/script.js';
const UMAMI_WEBSITE_ID = '0d1e2f34-5678-49ab-cdef-0123456789ab';

/** The question only exists under a provider that needs a cookie. */
function useGaMode(): void {
  vi.stubEnv('VITE_GA_MEASUREMENT_ID', MEASUREMENT_ID);
  vi.stubEnv('VITE_UMAMI_SRC', '');
  vi.stubEnv('VITE_UMAMI_WEBSITE_ID', '');
}

function useUmamiMode(): void {
  vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');
  vi.stubEnv('VITE_UMAMI_SRC', UMAMI_SRC);
  vi.stubEnv('VITE_UMAMI_WEBSITE_ID', UMAMI_WEBSITE_ID);
}

type ConsentModule = typeof import('@/core/composables/cookie-consent');

async function loadConsent(): Promise<ConsentModule> {
  return import('@/core/composables/cookie-consent');
}

function storedRecord(): Record<string, unknown> {
  const raw = localStorage.getItem(STORAGE_KEY);

  expect(raw).not.toBeNull();

  return JSON.parse(raw as string) as Record<string, unknown>;
}

/**
 * Mirrors the gate in App.vue: analytics is loaded from a reactive effect that
 * only ever fires once consent reads as accepted.
 */
function gateAnalytics(allowed: { value: boolean }) {
  const initAnalytics = vi.fn();

  const stop = watchEffect(() => {
    if (allowed.value) {
      initAnalytics();
    }
  });

  return { initAnalytics, stop };
}

describe('cookie consent', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    useGaMode();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('starts undecided and keeps analytics off', async () => {
    const { useCookieConsent } = await loadConsent();
    const consent = useCookieConsent();
    const { initAnalytics } = gateAnalytics(consent.analyticsAllowed);

    expect(consent.status.value).toBe('undecided');
    expect(consent.isDecided.value).toBeFalsy();
    expect(consent.analyticsAllowed.value).toBeFalsy();
    // Nothing decided means nothing loaded — no pre-ticked analytics.
    expect(initAnalytics).not.toHaveBeenCalled();
    // ...and the visitor is asked.
    expect(consent.isBannerVisible.value).toBeTruthy();
  });

  it('accepting persists the choice and enables analytics', async () => {
    const { useCookieConsent, CONSENT_VERSION } = await loadConsent();
    const consent = useCookieConsent();
    const { initAnalytics } = gateAnalytics(consent.analyticsAllowed);

    consent.accept();
    await nextTick();

    expect(consent.status.value).toBe('accepted');
    expect(consent.analyticsAllowed.value).toBeTruthy();
    // Accepting mid-session starts analytics without a reload.
    expect(initAnalytics).toHaveBeenCalledTimes(1);
    expect(consent.isBannerVisible.value).toBeFalsy();

    const record = storedRecord();

    expect(record.analytics).toBeTruthy();
    expect(record.version).toBe(CONSENT_VERSION);
    expect(typeof record.decidedAt).toBe('number');
  });

  it('declining persists the choice and keeps analytics off', async () => {
    const { useCookieConsent } = await loadConsent();
    const consent = useCookieConsent();
    const { initAnalytics } = gateAnalytics(consent.analyticsAllowed);

    consent.decline();
    await nextTick();

    expect(consent.status.value).toBe('declined');
    expect(consent.isDecided.value).toBeTruthy();
    expect(consent.analyticsAllowed.value).toBeFalsy();
    expect(initAnalytics).not.toHaveBeenCalled();
    expect(consent.isBannerVisible.value).toBeFalsy();
    expect(storedRecord().analytics).toBeFalsy();
  });

  it('reads a stored acceptance back on the next visit', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, decidedAt: 1, analytics: true }),
    );

    const { useCookieConsent } = await loadConsent();
    const consent = useCookieConsent();

    expect(consent.status.value).toBe('accepted');
    expect(consent.isBannerVisible.value).toBeFalsy();
  });

  it('reads a legacy record without an analytics field as declined', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, decidedAt: 1 }),
    );

    const { useCookieConsent } = await loadConsent();
    const consent = useCookieConsent();
    const { initAnalytics } = gateAnalytics(consent.analyticsAllowed);

    expect(consent.status.value).toBe('declined');
    expect(consent.analyticsAllowed.value).toBeFalsy();
    expect(initAnalytics).not.toHaveBeenCalled();
  });

  it('refuses a truthy analytics value that is not exactly true', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, decidedAt: 1, analytics: 'yes' }),
    );

    const { useCookieConsent } = await loadConsent();

    expect(useCookieConsent().status.value).toBe('declined');
  });

  it('asks again when the stored record predates the current version', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 0, decidedAt: 1, analytics: true }),
    );

    const { useCookieConsent } = await loadConsent();
    const consent = useCookieConsent();

    expect(consent.status.value).toBe('undecided');
    expect(consent.analyticsAllowed.value).toBeFalsy();
  });

  it('asks again when the stored record is unreadable', async () => {
    localStorage.setItem(STORAGE_KEY, 'not json');

    const { useCookieConsent } = await loadConsent();

    expect(useCookieConsent().status.value).toBe('undecided');
  });

  it('reopens the question without discarding the stored choice', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, decidedAt: 1, analytics: true }),
    );

    const { useCookieConsent, openCookieConsent } = await loadConsent();
    const consent = useCookieConsent();

    expect(consent.isBannerVisible.value).toBeFalsy();

    openCookieConsent();

    expect(consent.isBannerVisible.value).toBeTruthy();
    // Backing out has to leave the visitor with the choice they already made.
    expect(consent.status.value).toBe('accepted');
    expect(storedRecord().analytics).toBeTruthy();

    consent.decline();

    expect(consent.isBannerVisible.value).toBeFalsy();
    expect(storedRecord().analytics).toBeFalsy();
  });

  it('degrades to undecided when storage throws', async () => {
    const getItem = vi
      .spyOn(globalThis.localStorage, 'getItem')
      .mockImplementation(() => {
        throw new Error('denied');
      });

    const { useCookieConsent } = await loadConsent();

    expect(useCookieConsent().status.value).toBe('undecided');

    getItem.mockRestore();
  });
});

describe('cookie consent under a cookieless provider', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    useUmamiMode();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('never shows the banner', async () => {
    const { useCookieConsent } = await loadConsent();
    const consent = useCookieConsent();

    expect(consent.isConsentRequired.value).toBeFalsy();
    // Nothing was ever asked, so the visitor is still "undecided" — the banner
    // must stay away all the same.
    expect(consent.status.value).toBe('undecided');
    expect(consent.isBannerVisible.value).toBeFalsy();
  });

  it('ignores a request to reopen the question', async () => {
    const { useCookieConsent, openCookieConsent } = await loadConsent();
    const consent = useCookieConsent();

    openCookieConsent();
    await nextTick();

    // The footer control is hidden in this mode; if anything else reaches
    // here, an empty banner is the one outcome that must not happen.
    expect(consent.isBannerVisible.value).toBeFalsy();
  });

  it('leaves a decision recorded under GA untouched', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, decidedAt: 0, analytics: false }),
    );

    const { useCookieConsent } = await loadConsent();
    const consent = useCookieConsent();

    // Nothing is dropped: switching back to GA has to find the old refusal.
    expect(consent.status.value).toBe('declined');
    expect(consent.isBannerVisible.value).toBeFalsy();
  });
});
