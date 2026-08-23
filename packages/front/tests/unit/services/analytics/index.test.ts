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

function stubProvider(name: string, available: boolean) {
  return {
    name,
    isAvailable: vi.fn(() => available),
    load: vi.fn(),
    trackPageView: vi.fn(),
    trackEvent: vi.fn(),
  };
}

async function loadAnalytics(available: boolean) {
  const provider = stubProvider('ga', available);
  // Only one provider is ever available at a time; the others have to be
  // stubbed out or the real modules would read the ambient env.
  const umami = stubProvider('umami', false);
  const cloudflare = stubProvider('cloudflare', false);

  vi.doMock('@/services/analytics/ga', () => ({ gaProvider: provider }));
  vi.doMock('@/services/analytics/umami', () => ({ umamiProvider: umami }));
  vi.doMock('@/services/analytics/cloudflare', () => ({
    cloudflareProvider: cloudflare,
  }));

  const module = await import('@/services/analytics');

  return { module, provider, umami, cloudflare };
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

  it('reports a repeated navigation to the same route only once', async () => {
    const { module, provider } = await loadAnalytics(true);
    const { router, navigate } = stubRouter('/haiku', 'Haiku');

    module.initAnalytics(router);
    // InkBrushNav lets RouterLink navigate and then pushes the same route
    // again, so afterEach fires twice for one click.
    navigate('/blog', 'Blog');
    navigate('/blog', 'Blog');

    const blogViews = provider.trackPageView.mock.calls.filter(
      ([view]) => view.path === '/blog',
    );

    expect(blogViews).toHaveLength(1);
  });

  it('reports a route revisited after leaving it', async () => {
    const { module, provider } = await loadAnalytics(true);
    const { router, navigate } = stubRouter('/', 'Home');

    module.initAnalytics(router);
    navigate('/blog', 'Blog');
    navigate('/', 'Home');

    // Only consecutive repeats collapse — coming back is a real visit.
    expect(provider.trackPageView).toHaveBeenCalledTimes(3);
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

  it('reports through the one provider the mode selected', async () => {
    const ga = stubProvider('ga', false);
    const umami = stubProvider('umami', true);
    const cloudflare = stubProvider('cloudflare', false);

    vi.doMock('@/services/analytics/ga', () => ({ gaProvider: ga }));
    vi.doMock('@/services/analytics/umami', () => ({ umamiProvider: umami }));
    vi.doMock('@/services/analytics/cloudflare', () => ({
      cloudflareProvider: cloudflare,
    }));

    const module = await import('@/services/analytics');
    const { router } = stubRouter('/haiku', 'Haiku');

    module.initAnalytics(router);
    module.trackEvent('haiku_generated');

    expect(umami.load).toHaveBeenCalledTimes(1);
    expect(umami.trackPageView).toHaveBeenCalledTimes(1);
    expect(umami.trackEvent).toHaveBeenCalledWith('haiku_generated', undefined);
    // Switching providers must not leave the old tag sending in parallel.
    expect(ga.load).not.toHaveBeenCalled();
    expect(ga.trackPageView).not.toHaveBeenCalled();
    expect(ga.trackEvent).not.toHaveBeenCalled();
  });
});
