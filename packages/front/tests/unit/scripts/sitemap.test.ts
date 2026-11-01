import { describe, expect, it } from 'vitest';
import { generateSitemap } from '../../../scripts/generate-sitemap';

describe('sitemap', () => {
  it('omits the game when its route is disabled and normalizes the site origin', () => {
    const xml = new DOMParser().parseFromString(
      generateSitemap({ baseUrl: 'https://example.com/', gameEnabled: false }),
      'application/xml',
    );
    const urls = [...xml.getElementsByTagName('loc')].map(
      (node) => node.textContent!,
    );
    expect(urls).not.toContain('https://example.com/game');
    expect(urls).toContain('https://example.com/blog');
    expect(urls).toHaveLength(6);
  });

  it('lists each canonical article once without translation filename suffixes', () => {
    const xml = new DOMParser().parseFromString(
      generateSitemap(),
      'application/xml',
    );
    expect(xml.querySelector('parsererror')).toBeNull();
    const urls = [...xml.getElementsByTagName('loc')].map(
      (node) => node.textContent!,
    );
    const articles = urls.filter((url) => url.includes('/blog/'));
    expect(articles).toHaveLength(3);
    expect(new Set(urls).size).toBe(urls.length);
    expect(articles.every((url) => !/\.(en|fr|ja)$/.test(url))).toBeTruthy();
    expect(articles).toContain(
      'https://gutenku.xyz/blog/gutenku-technical-deep-dive',
    );
  });

  it('does not invent last modification dates on each build', () => {
    const xml = new DOMParser().parseFromString(
      generateSitemap(),
      'application/xml',
    );
    expect(xml.getElementsByTagName('lastmod')).toHaveLength(0);
  });
});
