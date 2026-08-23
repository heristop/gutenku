import { canHostTag, getUmamiConfig, resolveAnalyticsMode } from './config';
import type { AnalyticsProvider, EventParams, PageView } from './types';

type UmamiProps = Record<string, unknown>;

interface UmamiTracker {
  track(payload?: UmamiProps | ((props: UmamiProps) => UmamiProps)): void;
  track(name: string, data?: EventParams): void;
}

const SCRIPT_ID = 'umami-tracker';

/**
 * The tracker script is async, so the entry page view is queued more often than
 * not. The cap only matters when the script never arrives — a blocked host or a
 * down instance — where an unbounded queue would grow for the whole session.
 */
const MAX_QUEUED_CALLS = 20;

let loaded = false;
let failed = false;
let queue: Array<(tracker: UmamiTracker) => void> = [];

function getTracker(): UmamiTracker | undefined {
  return (globalThis as { umami?: UmamiTracker }).umami;
}

export function isUmamiAvailable(): boolean {
  return canHostTag() && resolveAnalyticsMode() === 'umami';
}

function send(call: (tracker: UmamiTracker) => void): void {
  if (!loaded) {
    return;
  }

  const tracker = getTracker();

  if (tracker) {
    call(tracker);

    return;
  }

  // The script errored: every later call would buffer a closure that has
  // nothing left to flush it, so stop holding them at all.
  if (failed) {
    return;
  }

  if (queue.length >= MAX_QUEUED_CALLS) {
    queue.shift();
  }

  queue.push(call);
}

function flush(): void {
  const tracker = getTracker();
  const pending = queue;

  queue = [];

  if (!tracker) {
    return;
  }

  for (const call of pending) {
    call(tracker);
  }
}

export const umamiProvider: AnalyticsProvider = {
  name: 'umami',

  isAvailable: isUmamiAvailable,

  load(): void {
    if (loaded || !isUmamiAvailable()) {
      return;
    }

    const config = getUmamiConfig();

    if (!config) {
      return;
    }

    loaded = true;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = config.scriptSrc;
    script.dataset.websiteId = config.websiteId;
    // The router sends page views itself, exactly as it does for GA. Left on,
    // the tracker would report the entry page a second time on its own.
    script.dataset.autoTrack = 'false';

    if (config.hostUrl) {
      script.dataset.hostUrl = config.hostUrl;
    }

    script.addEventListener('load', flush, { once: true });
    // An ad blocker or an unreachable instance: drop what was buffered rather
    // than hold navigations for a tracker that is never coming.
    script.addEventListener(
      'error',
      () => {
        failed = true;
        queue = [];
      },
      { once: true },
    );

    document.head.append(script);
  },

  trackPageView({ path, title }: PageView): void {
    send((tracker) => {
      // The callback form receives the tracker's own props and returns an
      // override. Passing a bare object instead would drop the website id the
      // script injected, and the hit would be rejected.
      tracker.track((props) => ({
        ...props,
        url: path,
        ...(title ? { title } : {}),
      }));
    });
  },

  trackEvent(name: string, params: EventParams = {}): void {
    send((tracker) => {
      tracker.track(name, params);
    });
  },
};

/** Test seam: module scope would otherwise leak between cases. */
export function resetUmamiForTests(): void {
  loaded = false;
  failed = false;
  queue = [];
}
