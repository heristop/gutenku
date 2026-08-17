import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, watchEffect } from 'vue';

const STORAGE_KEY = 'gutenku-cookie-consent';

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
