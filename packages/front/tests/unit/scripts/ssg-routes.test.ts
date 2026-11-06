import { describe, expect, it } from 'vitest';
import { normalizeSsgRoutes } from '../../../scripts/ssg-routes';

describe('prerendered route URLs', () => {
  it('normalizes relative child routes so the library is never rendered as /game/game/journal', () => {
    expect(
      normalizeSsgRoutes(
        ['', 'game', 'game/journal', '/game', 'blog/:slug', ':pathMatch(.*)*'],
        ['/', '/game', '/how-to-play'],
      ),
    ).toEqual(['/', '/game', '/game/journal', '/how-to-play']);
  });
});
