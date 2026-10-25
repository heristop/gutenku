// When the install invitation may appear: pure rules over what we remember of
// the visitor. Environment checks (standalone, native, browser support) and
// the moment itself live in pwa-install.ts.

export const PWA_PROMPT_STORAGE_KEY = 'gutenku-pwa-prompt';
export const LEGACY_STORAGE_KEYS = {
  engagement: 'gutenku-pwa-engagement',
  dismissal: 'gutenku-pwa-dismissal',
  firstVisit: 'gutenku-pwa-first-visit',
} as const;

/** Distinct calendar days on which the site was opened. */
export const MIN_VISIT_DAYS = 3;
/** Haiku viewed or crafted, when no GutenGuess game has been completed. */
export const MIN_HAIKU_VIEWS = 3;
/** Quiet days after the 1st and 2nd "Not now"; the next one is final. */
export const DISMISS_BACKOFF_DAYS: readonly number[] = [14, 45];

const DAY_MS = 24 * 60 * 60 * 1000;

export interface PwaPromptState {
  /** Local YYYY-MM-DD keys, newest last, capped at MIN_VISIT_DAYS. */
  visitDays: string[];
  haikuViews: number;
  gamesPlayed: number;
  gameCompleted: boolean;
  dismissCount: number;
  dismissedAt: number;
  optedOut: boolean;
  installed: boolean;
}

export function initialPromptState(): PwaPromptState {
  return {
    visitDays: [],
    haikuViews: 0,
    gamesPlayed: 0,
    gameCompleted: false,
    dismissCount: 0,
    dismissedAt: 0,
    optedOut: false,
    installed: false,
  };
}

export function dayKey(time: number): string {
  const date = new Date(time);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

export function withVisit(state: PwaPromptState, now: number): PwaPromptState {
  const today = dayKey(now);

  if (state.visitDays.includes(today)) {
    return state;
  }

  return {
    ...state,
    visitDays: [...state.visitDays, today].slice(-MIN_VISIT_DAYS),
  };
}

export function isEngaged(state: PwaPromptState): boolean {
  return (
    state.visitDays.length >= MIN_VISIT_DAYS &&
    (state.gameCompleted || state.haikuViews >= MIN_HAIKU_VIEWS)
  );
}

/** Epoch ms from which the invitation may return; Infinity means never. */
export function snoozedUntil(state: PwaPromptState): number {
  if (state.installed || state.optedOut) {
    return Infinity;
  }

  if (state.dismissCount === 0) {
    return 0;
  }

  const backoffDays = DISMISS_BACKOFF_DAYS[state.dismissCount - 1];

  return backoffDays === undefined
    ? Infinity
    : state.dismissedAt + backoffDays * DAY_MS;
}

export function isPromptDue(state: PwaPromptState, now: number): boolean {
  return isEngaged(state) && now >= snoozedUntil(state);
}

function readJson<T>(storage: Storage, key: string): Partial<T> | null {
  try {
    const raw = storage.getItem(key);

    return raw === null ? null : (JSON.parse(raw) as Partial<T>);
  } catch {
    return null;
  }
}

function readLegacyValues(storage: Storage) {
  const engagement = readJson<{
    haikuViewCount: number;
    gamePlayedCount: number;
  }>(storage, LEGACY_STORAGE_KEYS.engagement);
  const dismissal = readJson<{ count: number }>(
    storage,
    LEGACY_STORAGE_KEYS.dismissal,
  );

  return {
    found: Boolean(engagement || dismissal),
    haikuViews: engagement?.haikuViewCount ?? 0,
    gamesPlayed: engagement?.gamePlayedCount ?? 0,
    dismissCount: dismissal?.count ?? 0,
    firstVisitAt: Number(storage.getItem(LEGACY_STORAGE_KEYS.firstVisit)) || 0,
  };
}

/**
 * Carries the pre-backoff keys over. Someone who already said no starts a
 * fresh quiet period from today rather than being asked again at once.
 * Returns null when there was nothing to migrate.
 */
export function migrateLegacyState(
  storage: Storage,
  now: number,
): PwaPromptState | null {
  const legacy = readLegacyValues(storage);

  for (const key of Object.values(LEGACY_STORAGE_KEYS)) {
    storage.removeItem(key);
  }

  if (!legacy.found && !legacy.firstVisitAt) {
    return null;
  }

  const visitedBefore =
    legacy.firstVisitAt > 0 && dayKey(legacy.firstVisitAt) !== dayKey(now);

  return {
    ...initialPromptState(),
    haikuViews: legacy.haikuViews,
    gamesPlayed: legacy.gamesPlayed,
    visitDays: visitedBefore ? [dayKey(legacy.firstVisitAt)] : [],
    dismissCount: legacy.dismissCount,
    dismissedAt: legacy.dismissCount > 0 ? now : 0,
  };
}
