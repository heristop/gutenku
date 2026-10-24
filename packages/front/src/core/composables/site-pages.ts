import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { GAME_ENABLED } from '@/features/game/config';

export interface SitePage {
  to: string;
  labelKey: string;
  numeral: string;
  pageNumber: string;
}

const NUMERALS = ['i', 'ii', 'iii', 'iv', 'v', 'vi'];

const PAGES: Array<Omit<SitePage, 'numeral' | 'pageNumber'>> = [
  { to: '/', labelKey: 'nav.homeLabel' },
  ...(GAME_ENABLED ? [{ to: '/game', labelKey: 'nav.gameLabel' }] : []),
  { to: '/haiku', labelKey: 'nav.haikuLabel' },
  { to: '/blog', labelKey: 'nav.blogLabel' },
];

// The site read as a book: each top-level page gets a roman numeral in the
// table of contents and a page number on the spine.
export const SITE_PAGES: SitePage[] = PAGES.map((page, index) => ({
  ...page,
  numeral: NUMERALS[index] ?? String(index + 1),
  pageNumber: String(index + 1).padStart(2, '0'),
}));

export function isPageActive(pagePath: string, routePath: string): boolean {
  if (pagePath === '/') {
    return routePath === '/';
  }

  return routePath === pagePath || routePath.startsWith(`${pagePath}/`);
}

export function useSitePages() {
  const route = useRoute();

  const currentPage = computed(
    () => SITE_PAGES.find((page) => isPageActive(page.to, route.path)) ?? null,
  );

  const isActive = (path: string) => isPageActive(path, route.path);

  return { pages: SITE_PAGES, currentPage, isActive };
}
