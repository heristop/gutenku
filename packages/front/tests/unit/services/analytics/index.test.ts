import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Router } from 'vue-router';

interface StubRouter {
  router: Router;
  navigate: (path: string, title?: string) => void;
}

function stubRouter(path: string, title?: string): StubRouter {
  const hooks: Array<(to: unknown) => void> = [];
  const currentRoute = { value: { fullPath: path, meta: { title } } };

  return {
    router: {
      currentRoute,
      afterEach: (hook: (to: unknown) => void) => hooks.push(hook),
    } as unknown as Router,
    navigate(nextPath, nextTitle) {
      for (const hook of hooks) {
        hook({ fullPath: nextPath, meta: { title: nextTitle } });
      }
    },
  };
}

async function loadAnalytics(available: boolean) {
  const provider = {
    name: 'stub',
    isAvailable: vi.fn(() => available),
    load: vi.fn(),
    trackPageView: vi.fn(),
    trackEvent: vi.fn(),
  };

  vi.doMock('@/services/analytics/ga', () => ({ gaProvider: provider }));

  const module = await import('@/services/analytics');

  return { module, provider };
}

describe('initAnalytics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('loads the provider and reports the entry route', async () => {
    const { module, provider } = await loadAnalytics(true);
    const { router } = stubRouter('/haiku', 'Haiku');

    module.initAnalytics(router);

    expect(provider.load).toHaveBeenCalledTimes(1);
    // Loading is deferred to idle, so afterEach never fires for the entry
    // route — it has to be reported explicitly or the landing page is lost.
    expect(provider.trackPageView).toHaveBeenCalledWith({
      path: '/haiku',
      title: 'Haiku',
    });
  });

  it('reports subsequent navigations', async () => {
    const { module, provider } = await loadAnalytics(true);
    const { router, navigate } = stubRouter('/', 'Home');

    module.initAnalytics(router);
    navigate('/game', 'GutenGuess');

    expect(provider.trackPageView).toHaveBeenLastCalledWith({
      path: '/game',
      title: 'GutenGuess',
    });
  });

  it('only registers once', async () => {
    const { module, provider } = await loadAnalytics(true);
    const { router } = stubRouter('/', 'Home');

    module.initAnalytics(router);
    module.initAnalytics(router);

    expect(provider.load).toHaveBeenCalledTimes(1);
    expect(provider.trackPageView).toHaveBeenCalledTimes(1);
  });

  it('does nothing when no provider is available', async () => {
    const { module, provider } = await loadAnalytics(false);
    const { router, navigate } = stubRouter('/', 'Home');

    module.initAnalytics(router);
    navigate('/game', 'GutenGuess');

    expect(provider.load).not.toHaveBeenCalled();
    expect(provider.trackPageView).not.toHaveBeenCalled();
  });
});
