import { describe, it, expect, beforeEach } from 'vitest';
import {
  LEGACY_STORAGE_KEYS,
  dayKey,
  initialPromptState,
  isEngaged,
  isPromptDue,
  migrateLegacyState,
  snoozedUntil,
  withVisit,
  type PwaPromptState,
} from '@/core/composables/pwa-install-gate';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 9, 24, 12).getTime();

function visitedOn(days: number, patch: Partial<PwaPromptState> = {}) {
  let state = initialPromptState();

  for (let i = days - 1; i >= 0; i--) {
    state = withVisit(state, NOW - i * DAY);
  }

  return { ...state, ...patch };
}

describe('pwa install gate', () => {
  describe('visit days', () => {
    it('counts distinct days, not page views', () => {
      let state = initialPromptState();
      state = withVisit(state, NOW);
      state = withVisit(state, NOW + 60_000);
      state = withVisit(state, NOW + 2 * 60 * 60 * 1000);

      expect(state.visitDays).toEqual([dayKey(NOW)]);
    });

    it('keeps only what the gate needs', () => {
      expect(visitedOn(10).visitDays).toHaveLength(3);
    });
  });

  describe('engagement', () => {
    it('needs three distinct days', () => {
      expect(isEngaged(visitedOn(2, { gameCompleted: true }))).toBeFalsy();
      expect(isEngaged(visitedOn(3, { gameCompleted: true }))).toBeTruthy();
    });

    it('needs a completed game or three haiku', () => {
      expect(isEngaged(visitedOn(3))).toBeFalsy();
      expect(isEngaged(visitedOn(3, { haikuViews: 2 }))).toBeFalsy();
      expect(isEngaged(visitedOn(3, { haikuViews: 3 }))).toBeTruthy();
      // Starting a game is not finishing one
      expect(isEngaged(visitedOn(3, { gamesPlayed: 5 }))).toBeFalsy();
    });
  });

  describe('backoff', () => {
    const engaged = visitedOn(3, { haikuViews: 3 });

    it('is due when engaged and never dismissed', () => {
      expect(isPromptDue(engaged, NOW)).toBeTruthy();
    });

    it('waits 14 days after the first "Not now"', () => {
      const state = { ...engaged, dismissCount: 1, dismissedAt: NOW };

      expect(isPromptDue(state, NOW + 13 * DAY)).toBeFalsy();
      expect(isPromptDue(state, NOW + 14 * DAY)).toBeTruthy();
    });

    it('waits 45 days after the second', () => {
      const state = { ...engaged, dismissCount: 2, dismissedAt: NOW };

      expect(isPromptDue(state, NOW + 44 * DAY)).toBeFalsy();
      expect(isPromptDue(state, NOW + 45 * DAY)).toBeTruthy();
    });

    it('stops for good after the third', () => {
      const state = { ...engaged, dismissCount: 3, dismissedAt: NOW };

      expect(snoozedUntil(state)).toBe(Infinity);
      expect(isPromptDue(state, NOW + 1000 * DAY)).toBeFalsy();
    });

    it('stops for good on "Don\'t ask again" or after an install', () => {
      expect(snoozedUntil({ ...engaged, optedOut: true })).toBe(Infinity);
      expect(snoozedUntil({ ...engaged, installed: true })).toBe(Infinity);
    });
  });

  describe('legacy migration', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('returns null and leaves nothing behind for new visitors', () => {
      expect(migrateLegacyState(localStorage, NOW)).toBeNull();
    });

    it('restarts the quiet period for someone who dismissed before', () => {
      localStorage.setItem(
        LEGACY_STORAGE_KEYS.dismissal,
        JSON.stringify({ dismissedAt: NOW - 40 * DAY, count: 1 }),
      );
      localStorage.setItem(
        LEGACY_STORAGE_KEYS.engagement,
        JSON.stringify({ haikuViewCount: 9, gamePlayedCount: 2 }),
      );
      localStorage.setItem(
        LEGACY_STORAGE_KEYS.firstVisit,
        String(NOW - 60 * DAY),
      );

      const state = migrateLegacyState(localStorage, NOW)!;

      expect(state).toMatchObject({
        haikuViews: 9,
        gamesPlayed: 2,
        dismissCount: 1,
        dismissedAt: NOW,
        visitDays: [dayKey(NOW - 60 * DAY)],
      });
      const engagedSince = { ...state, visitDays: visitedOn(3).visitDays };

      expect(isPromptDue(engagedSince, NOW + DAY)).toBeFalsy();
      expect(isPromptDue(engagedSince, NOW + 14 * DAY)).toBeTruthy();

      for (const key of Object.values(LEGACY_STORAGE_KEYS)) {
        expect(localStorage.getItem(key)).toBeNull();
      }
    });

    it('survives corrupt legacy values', () => {
      localStorage.setItem(LEGACY_STORAGE_KEYS.engagement, '{oops');
      localStorage.setItem(LEGACY_STORAGE_KEYS.firstVisit, String(NOW));

      const state = migrateLegacyState(localStorage, NOW)!;

      expect(state.haikuViews).toBe(0);
      // A first visit today is today's visit, recorded by the composable
      expect(state.visitDays).toEqual([]);
    });
  });
});
