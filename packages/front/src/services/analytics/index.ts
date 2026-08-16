import type { RouteLocationNormalized, Router } from 'vue-router';
import { gaProvider } from './ga';
import type { AnalyticsProvider, EventParams, PageView } from './types';

const providers: AnalyticsProvider[] = [gaProvider];

let started = false;

function activeProviders(): AnalyticsProvider[] {
  return providers.filter((provider) => provider.isAvailable());
}

export function trackPageView(view: PageView): void {
  for (const provider of activeProviders()) {
    provider.trackPageView(view);
  }
}

export function trackEvent(name: string, params?: EventParams): void {
  for (const provider of activeProviders()) {
    provider.trackEvent(name, params);
  }
}

/**
 * Routes carry their own `meta.title`, which is set before navigation resolves.
 * document.title is only a fallback: @unhead/vue writes it asynchronously, so
 * reading it here can still return the previous page's title.
 */
function routeTitle(route: RouteLocationNormalized): string | undefined {
  const title = route.meta?.title;

  if (typeof title === 'string') {
    return title;
  }

  return typeof document === 'undefined' ? undefined : document.title;
}

/**
 * Loads every available provider and reports navigations for the app's
 * lifetime. Call once, from the client only.
 */
export function initAnalytics(router: Router): void {
  if (started) {
    return;
  }

  const active = activeProviders();

  if (active.length === 0) {
    return;
  }

  started = true;

  for (const provider of active) {
    provider.load();
  }

  // Loading is deferred to an idle callback, so the entry route has already
  // resolved and afterEach will not fire for it. Report it explicitly.
  const current = router.currentRoute.value;

  trackPageView({ path: current.fullPath, title: routeTitle(current) });

  router.afterEach((to) => {
    trackPageView({ path: to.fullPath, title: routeTitle(to) });
  });
}

/** Test seam: module-scope `started` would otherwise leak between cases. */
export function resetAnalyticsForTests(): void {
  started = false;
}

export type { AnalyticsProvider, EventParams, PageView };
