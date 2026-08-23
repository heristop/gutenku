import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const SCRIPT_SRC = 'https://stats.example.test/script.js';
const WEBSITE_ID = '0d1e2f34-5678-49ab-cdef-0123456789ab';

interface TrackerStub {
  track: ReturnType<typeof vi.fn>;
}

async function loadProvider(options: { native?: boolean } = {}) {
  vi.doMock('@/utils/capacitor', () => ({ isNative: options.native ?? false }));

  return import('@/services/analytics/umami');
}

function trackerScript(): HTMLScriptElement | null {
  return document.querySelector<HTMLScriptElement>('script#umami-tracker');
}

/** Stands in for the async script arriving: the tracker appears, then `load`. */
function arrive(): TrackerStub {
  const tracker: TrackerStub = { track: vi.fn() };

  (globalThis as { umami?: TrackerStub }).umami = tracker;
  trackerScript()?.dispatchEvent(new Event('load'));

  return tracker;
}

describe('umami provider', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_UMAMI_SRC', SCRIPT_SRC);
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', WEBSITE_ID);
    vi.stubEnv('VITE_UMAMI_HOST_URL', '');
    document.head.innerHTML = '';
    delete (globalThis as { umami?: TrackerStub }).umami;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('injects the tracker script exactly once, with auto-track off', async () => {
    const { umamiProvider } = await loadProvider();

    umamiProvider.load();
    umamiProvider.load();

    const tags = document.querySelectorAll('script#umami-tracker');

    expect(tags).toHaveLength(1);
    expect(trackerScript()?.src).toBe(SCRIPT_SRC);
    expect(trackerScript()?.dataset.websiteId).toBe(WEBSITE_ID);
    // The router reports navigations itself; auto-track would double the
    // entry page.
    expect(trackerScript()?.dataset.autoTrack).toBe('false');
    // Unset unless the collect API lives on another origin.
    expect(trackerScript()?.dataset.hostUrl).toBeUndefined();
  });

  it('passes a separate collect host through to the script', async () => {
    vi.stubEnv('VITE_UMAMI_HOST_URL', 'https://collect.example.test');

    const { umamiProvider } = await loadProvider();

    umamiProvider.load();

    expect(trackerScript()?.dataset.hostUrl).toBe(
      'https://collect.example.test',
    );
  });

  it('replays page views buffered before the async script arrived', async () => {
    const { umamiProvider } = await loadProvider();

    umamiProvider.load();
    // The entry route is reported the moment analytics starts, which is almost
    // always before the tracker has finished downloading.
    umamiProvider.trackPageView({ path: '/haiku', title: 'Haiku' });

    const tracker = arrive();

    expect(tracker.track).toHaveBeenCalledTimes(1);

    const override = tracker.track.mock.calls[0][0] as (
      props: Record<string, unknown>,
    ) => Record<string, unknown>;

    // The callback form keeps the website id the script injected; a bare
    // object would drop it and the hit would be rejected.
    expect(override({ website: WEBSITE_ID, url: '/' })).toMatchObject({
      website: WEBSITE_ID,
      url: '/haiku',
      title: 'Haiku',
    });
  });

  it('sends straight through once the tracker is present', async () => {
    const { umamiProvider } = await loadProvider();

    umamiProvider.load();

    const tracker = arrive();

    umamiProvider.trackEvent('haiku_generated', { source: 'button' });

    expect(tracker.track).toHaveBeenCalledWith('haiku_generated', {
      source: 'button',
    });
  });

  it('drops the queue when the script fails to load', async () => {
    const { umamiProvider } = await loadProvider();

    umamiProvider.load();
    umamiProvider.trackPageView({ path: '/haiku' });
    // An ad blocker, or an instance that is down.
    trackerScript()?.dispatchEvent(new Event('error'));

    const tracker = arrive();

    expect(tracker.track).not.toHaveBeenCalled();
  });

  it('stops buffering once the script has failed', async () => {
    const { umamiProvider } = await loadProvider();

    umamiProvider.load();
    trackerScript()?.dispatchEvent(new Event('error'));

    // Every later navigation would otherwise retain a closure with nothing
    // left to flush it — the queue would refill and stay full for the session.
    for (let index = 0; index < 50; index += 1) {
      umamiProvider.trackPageView({ path: `/page-${index}` });
    }

    const tracker = arrive();

    expect(tracker.track).not.toHaveBeenCalled();
  });

  it('caps the queue so a blocked tracker cannot grow it without bound', async () => {
    const { umamiProvider } = await loadProvider();

    umamiProvider.load();

    for (let index = 0; index < 50; index += 1) {
      umamiProvider.trackPageView({ path: `/page-${index}` });
    }

    const tracker = arrive();

    expect(tracker.track.mock.calls.length).toBeLessThanOrEqual(20);
    expect(tracker.track).toHaveBeenCalled();
  });

  it('is unavailable and loads nothing when half configured', async () => {
    vi.stubEnv('VITE_UMAMI_WEBSITE_ID', '');

    const { umamiProvider } = await loadProvider();

    expect(umamiProvider.isAvailable()).toBeFalsy();

    umamiProvider.load();

    expect(document.querySelectorAll('script#umami-tracker')).toHaveLength(0);
  });

  it('is unavailable inside a native Capacitor build', async () => {
    const { umamiProvider } = await loadProvider({ native: true });

    expect(umamiProvider.isAvailable()).toBeFalsy();

    umamiProvider.load();

    expect(document.querySelectorAll('script#umami-tracker')).toHaveLength(0);
  });

  it('drops events when the script was never injected', async () => {
    const { umamiProvider } = await loadProvider();

    umamiProvider.trackEvent('haiku_generated');

    const tracker = arrive();

    expect(tracker.track).not.toHaveBeenCalled();
  });
});
