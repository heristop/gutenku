export interface PageView {
  path: string;
  title?: string;
}

export type EventParams = Record<string, string | number | boolean>;

/**
 * A vendor-agnostic analytics sink. Providers are expected to no-op rather
 * than throw when they are unavailable, so callers never have to guard.
 */
export interface AnalyticsProvider {
  readonly name: string;
  /** False when the provider is unconfigured or the runtime cannot host it. */
  isAvailable(): boolean;
  /** Injects the vendor tag. Safe to call repeatedly; only the first works. */
  load(): void;
  trackPageView(view: PageView): void;
  trackEvent(name: string, params?: EventParams): void;
}
