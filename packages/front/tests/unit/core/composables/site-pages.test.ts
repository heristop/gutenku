import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reactive } from 'vue';

const route = reactive<{ path: string }>({ path: '/' });

vi.mock('vue-router', () => ({
  useRoute: () => route,
}));

const gameConfig = vi.hoisted(() => ({ enabled: true }));

vi.mock('@/features/game/config', () => ({
  get GAME_ENABLED() {
    return gameConfig.enabled;
  },
}));

async function load(gameEnabled: boolean) {
  gameConfig.enabled = gameEnabled;
  vi.resetModules();

  return import('@/core/composables/site-pages');
}

describe('site-pages', () => {
  beforeEach(() => {
    route.path = '/';
  });

  afterEach(() => {
    gameConfig.enabled = true;
  });

  describe('SITE_PAGES', () => {
    it('makes the library reachable when the game is enabled', async () => {
      const { SITE_PAGES } = await load(true);

      expect(SITE_PAGES.map((p) => p.to)).toEqual([
        '/',
        '/game',
        '/game/journal',
        '/haiku',
        '/blog',
      ]);
      expect(SITE_PAGES.map((p) => p.labelKey)).toEqual([
        'nav.homeLabel',
        'nav.gameLabel',
        'nav.libraryLabel',
        'nav.haikuLabel',
        'nav.blogLabel',
      ]);
      expect(SITE_PAGES.map((p) => p.numeral)).toEqual([
        'i',
        'ii',
        'iii',
        'iv',
        'v',
      ]);
      expect(SITE_PAGES.map((p) => p.pageNumber)).toEqual([
        '01',
        '02',
        '03',
        '04',
        '05',
      ]);
    });

    it('leaves the game out and renumbers when it is disabled', async () => {
      const { SITE_PAGES } = await load(false);

      expect(SITE_PAGES.map((p) => p.to)).toEqual(['/', '/haiku', '/blog']);
      expect(SITE_PAGES.map((p) => p.numeral)).toEqual(['i', 'ii', 'iii']);
      expect(SITE_PAGES.map((p) => p.pageNumber)).toEqual(['01', '02', '03']);
    });
  });

  describe('isPageActive', () => {
    it('matches home only on the exact root path', async () => {
      const { isPageActive } = await load(true);

      expect(isPageActive('/', '/')).toBeTruthy();
      expect(isPageActive('/', '/haiku')).toBeFalsy();
      expect(isPageActive('/', '')).toBeFalsy();
    });

    it('matches a page on its path and on nested paths', async () => {
      const { isPageActive } = await load(true);

      expect(isPageActive('/blog', '/blog')).toBeTruthy();
      expect(isPageActive('/blog', '/blog/some-post')).toBeTruthy();
    });

    it('does not match a sibling that merely shares a prefix', async () => {
      const { isPageActive } = await load(true);

      expect(isPageActive('/blog', '/blogger')).toBeFalsy();
      expect(isPageActive('/blog', '/haiku')).toBeFalsy();
    });
  });

  describe('useSitePages', () => {
    it('highlights only the library and gives it its own spine on the journal route', async () => {
      const { useSitePages } = await load(true);
      const { currentPage, isActive } = useSitePages();
      route.path = '/game/journal';
      expect(currentPage.value?.to).toBe('/game/journal');
      expect(isActive('/game/journal')).toBeTruthy();
      expect(isActive('/game')).toBeFalsy();
    });
    it('exposes the pages', async () => {
      const { useSitePages, SITE_PAGES } = await load(true);

      expect(useSitePages().pages).toBe(SITE_PAGES);
    });

    it('resolves the current page from the route and follows navigation', async () => {
      const { useSitePages } = await load(true);
      const { currentPage } = useSitePages();

      expect(currentPage.value?.to).toBe('/');

      route.path = '/haiku';

      expect(currentPage.value?.to).toBe('/haiku');

      route.path = '/blog/a-post';

      expect(currentPage.value?.to).toBe('/blog');
    });

    it('has no current page on an unknown route', async () => {
      const { useSitePages } = await load(true);
      const { currentPage } = useSitePages();

      route.path = '/nowhere';

      expect(currentPage.value).toBeNull();
    });

    it('answers isActive against the live route', async () => {
      const { useSitePages } = await load(true);
      const { isActive } = useSitePages();

      route.path = '/haiku/daily';

      expect(isActive('/haiku')).toBeTruthy();
      expect(isActive('/blog')).toBeFalsy();
      expect(isActive('/')).toBeFalsy();
    });
  });
});
