import { isNative } from '@/utils/capacitor';

/**
 * Umami self-hosted is cookieless and stores no visitor identifier, so it needs
 * no consent question. GA does. The mode therefore decides both which tag ships
 * and whether the cookie banner exists at all.
 */
export type AnalyticsMode = 'umami' | 'ga' | 'none';

export interface UmamiConfig {
  scriptSrc: string;
  websiteId: string;
  /** Only when the collect API answers on another origin than the script. */
  hostUrl?: string;
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

export function getGaMeasurementId(): string | undefined {
  return text(import.meta.env.VITE_GA_MEASUREMENT_ID);
}

/** Undefined unless both halves are set: neither one alone can send a hit. */
export function getUmamiConfig(): UmamiConfig | undefined {
  const scriptSrc = text(import.meta.env.VITE_UMAMI_SRC);
  const websiteId = text(import.meta.env.VITE_UMAMI_WEBSITE_ID);

  if (!scriptSrc || !websiteId) {
    return undefined;
  }

  return {
    scriptSrc,
    websiteId,
    hostUrl: text(import.meta.env.VITE_UMAMI_HOST_URL),
  };
}

/**
 * Umami wins over GA when both are configured, so a half-finished migration
 * measures once rather than twice. Native builds ship through the app stores
 * and carry no web tag at all.
 *
 * Deliberately free of any `document` check: the banner's visibility derives
 * from this, and vite-ssg prerenders in Node — a mode that changed between the
 * prerender and the client would make the footer hydrate against a different
 * tree.
 */
export function resolveAnalyticsMode(): AnalyticsMode {
  if (isNative) {
    return 'none';
  }

  if (getUmamiConfig()) {
    return 'umami';
  }

  return getGaMeasurementId() ? 'ga' : 'none';
}

/** False while prerendering: a vendor tag needs a live document to attach to. */
export function canHostTag(): boolean {
  return typeof document !== 'undefined';
}

export function isConsentRequired(): boolean {
  return resolveAnalyticsMode() === 'ga';
}
