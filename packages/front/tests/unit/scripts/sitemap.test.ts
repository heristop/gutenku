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
    expect(urls).not.toContain('https://example.com/how-to-play');
    expect(
      xml.getElementsByTagNameNS(
        'http://www.google.com/schemas/sitemap-video/1.1',
        'video',
      ),
    ).toHaveLength(0);
    expect(urls).toContain('https://example.com/blog');
    expect(urls).toHaveLength(7);
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

  it('associates the discoverable video with its watch page', () => {
    const xml = new DOMParser().parseFromString(
      generateSitemap(),
      'application/xml',
    );
    const videos = xml.getElementsByTagNameNS(
      'http://www.google.com/schemas/sitemap-video/1.1',
      'video',
    );
    expect(videos).toHaveLength(1);
    const video = videos[0];
    expect(
      video.parentElement?.getElementsByTagName('loc')[0].textContent,
    ).toBe('https://gutenku.xyz/how-to-play');

    for (const [name, value] of Object.entries({
      content_loc:
        'https://gutenku.xyz/media/gutenguess-promo.mp4?v=2026-11-06-library',
      thumbnail_loc: 'https://gutenku.xyz/media/gutenguess-promo.jpg',
      duration: '40',
    })) {
      expect(
        video.getElementsByTagNameNS(
          'http://www.google.com/schemas/sitemap-video/1.1',
          name,
        )[0].textContent,
      ).toBe(value);
    }
  });

  it('does not invent last modification dates on each build', () => {
    const xml = new DOMParser().parseFromString(
      generateSitemap(),
      'application/xml',
    );
    expect(xml.getElementsByTagName('lastmod')).toHaveLength(0);
  });
});
