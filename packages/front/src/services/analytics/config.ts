import { isNative } from '@/utils/capacitor';

/**
 * Self-hosted Umami and Cloudflare Web Analytics are both cookieless: neither
 * writes an identifier on the visitor's device, which is what a cookie banner
 * asks about, so neither needs a consent question. GA does. (Umami still
 * derives a pseudonymous visitor hash on the server — cookieless is not the
 * same claim as anonymous.) The mode therefore decides both which tag ships and
 * whether the cookie banner exists at all.
 *
 * It describes what is *configured*, not what will run: whether the runtime can
 * host a tag at all is the providers' question, answered by canHostTag().
 */
export type AnalyticsMode = 'umami' | 'cloudflare' | 'ga' | 'none';

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

/**
 * Cloudflare Web Analytics token. Cheaper than Umami — nothing to host — but it
 * collects page views only: the vendor exposes no event API at all.
 */
export function getCloudflareToken(): string | undefined {
  return text(import.meta.env.VITE_CLOUDFLARE_TOKEN);
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
 * Umami first, then Cloudflare, then GA. The order only decides who wins when
 * two are configured at once — a mistake rather than a state to honour — and it
 * puts the cookieless pair ahead of the tracker that is not, so a half-finished
 * migration measures once rather than twice.
 *
 * Deliberately free of every runtime signal — `document`, the platform — and
 * derived from the env alone. The footer's cookie control is prerendered from
 * this, and `cap:build` ships the very `dist` that vite-ssg prerendered in Node
 * to the app stores: a mode that answered differently on the device would make
 * the footer hydrate against a different tree.
 */
export function resolveAnalyticsMode(): AnalyticsMode {
  if (getUmamiConfig()) {
    return 'umami';
  }

  if (getCloudflareToken()) {
    return 'cloudflare';
  }

  return getGaMeasurementId() ? 'ga' : 'none';
}

/**
 * Whether this runtime can host a vendor tag at all: vite-ssg prerenders with
 * no document to attach one to, and native builds ship through the app stores
 * rather than the web property.
 */
export function canHostTag(): boolean {
  return typeof document !== 'undefined' && !isNative;
}

/** False when nothing is configured — not even a chunk is worth fetching. */
export function isAnalyticsEnabled(): boolean {
  return resolveAnalyticsMode() !== 'none';
}

export function isConsentRequired(): boolean {
  return resolveAnalyticsMode() === 'ga';
}
