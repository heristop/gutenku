import { isNative } from '@/utils/capacitor';
import type { AnalyticsProvider, EventParams, PageView } from './types';

type GtagArgs = unknown[];

const SCRIPT_ID = 'ga-gtag';

let loaded = false;

export function getMeasurementId(): string | undefined {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID;

  return typeof id === 'string' && id.length > 0 ? id : undefined;
}

export function isGaAvailable(): boolean {
  // vite-ssg prerenders without a document, and native builds ship through the
  // app stores rather than the web property.
  if (typeof document === 'undefined' || isNative) {
    return false;
  }

  return getMeasurementId() !== undefined;
}

/**
 * gtag.js only acts on a dataLayer entry that is an `arguments` object. A plain
 * array is pushed without error and then silently ignored: the GA4 container
 * never bootstraps and not a single hit is sent. Indexed reads look identical
 * either way, which is why the mistake is invisible from the outside.
 */
function toGtagCommand(args: GtagArgs): IArguments {
  function capture(this: void): IArguments {
    return arguments;
  }

  return Reflect.apply(capture, undefined, args) as IArguments;
}

function gtag(...args: GtagArgs): void {
  const scope = globalThis as { dataLayer?: unknown[] };
  scope.dataLayer = scope.dataLayer ?? [];
  scope.dataLayer.push(toGtagCommand(args));
}

export const gaProvider: AnalyticsProvider = {
  name: 'ga',

  isAvailable: isGaAvailable,

  load(): void {
    if (loaded || !isGaAvailable()) {
      return;
    }

    const id = getMeasurementId();

    if (!id) {
      return;
    }

    loaded = true;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.append(script);

    gtag('js', new Date());
    // The router sends page views itself. gtag would otherwise record only the
    // entry page, and the stream has history-based page views switched off so
    // the two cannot double count.
    gtag('config', id, { send_page_view: false });
  },

  trackPageView({ path, title }: PageView): void {
    if (!loaded) {
      return;
    }

    gtag('event', 'page_view', {
      page_path: path,
      page_location: globalThis.location?.href,
      ...(title ? { page_title: title } : {}),
    });
  },

  trackEvent(name: string, params: EventParams = {}): void {
    if (!loaded) {
      return;
    }

    gtag('event', name, params);
  },
};

/** Test seam: module-scope `loaded` would otherwise leak between cases. */
export function resetGaForTests(): void {
  loaded = false;
}
