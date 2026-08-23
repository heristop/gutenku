import { canHostTag, getCloudflareToken, resolveAnalyticsMode } from './config';
import type { AnalyticsProvider } from './types';

const SCRIPT_ID = 'cf-beacon';

let loaded = false;

export function isCloudflareAvailable(): boolean {
  return canHostTag() && resolveAnalyticsMode() === 'cloudflare';
}

/**
 * Cloudflare Web Analytics. The shortest provider here: the beacon collects
 * page views itself, so there is nothing to report and nothing to buffer.
 *
 * It also exposes no event API — no global, no `track()` — so `trackPageView`
 * and `trackEvent` cannot reach it even in principle. They are no-ops rather
 * than a fallthrough onto whatever global another tag happens to have left
 * behind, and the tests pin that. What it costs is anything beyond a page view.
 */
export const cloudflareProvider: AnalyticsProvider = {
  name: 'cloudflare',

  isAvailable: isCloudflareAvailable,

  load(): void {
    if (loaded || !isCloudflareAvailable()) {
      return;
    }

    const token = getCloudflareToken();

    if (!token) {
      return;
    }

    loaded = true;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    // The beacon reads its token from a JSON attribute rather than a plain one;
    // the quoting is what makes it readable at all.
    script.dataset.cfBeacon = JSON.stringify({ token });

    document.head.append(script);
  },

  trackPageView(): void {},

  trackEvent(): void {},
};

/** Test seam: module scope would otherwise leak between cases. */
export function resetCloudflareForTests(): void {
  loaded = false;
}
