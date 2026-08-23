import { computed, readonly, ref } from 'vue';
// Config only — reading it pulls in no vendor tag, so the analytics chunk stays
// lazily loaded as before.
import { isConsentRequired } from '@/services/analytics/config';

export type ConsentStatus = 'undecided' | 'accepted' | 'declined';

export interface ConsentRecord {
  version: number;
  decidedAt: number;
  analytics: boolean;
}

export const CONSENT_STORAGE_KEY = 'gutenku-cookie-consent';

/**
 * Bump when the purposes behind the question change. A record stamped with an
 * older version is not carried over: the visitor agreed to something else.
 */
export const CONSENT_VERSION = 1;

// Shared across every caller — the banner, App.vue and the footer all read and
// write the one decision, so accepting anywhere takes effect everywhere.
const status = ref<ConsentStatus>('undecided');
const isReopened = ref(false);

let hydrated = false;

/** vite-ssg prerenders without a window, so storage has to be probed. */
function hasStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    // Safari throws outright on storage access in some private modes.
    return null;
  }
}

/**
 * Anything unreadable falls back to "not decided yet" so the visitor is asked
 * again, and nothing but an explicit `analytics: true` ever reads as consent.
 */
function parseStatus(raw: string | null): ConsentStatus {
  if (raw === null) {
    return 'undecided';
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return 'undecided';
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return 'undecided';
  }

  const record = parsed as Partial<ConsentRecord>;

  if (record.version !== CONSENT_VERSION) {
    return 'undecided';
  }

  // A record from before analytics was tracked has no `analytics` field. It
  // counts as a refusal: silently opting someone in is the one outcome that
  // must be impossible.
  return record.analytics === true ? 'accepted' : 'declined';
}

function hydrate(): void {
  if (hydrated || !hasStorage()) {
    return;
  }

  hydrated = true;
  status.value = parseStatus(readRaw());
}

function persist(analytics: boolean): void {
  if (!hasStorage()) {
    return;
  }

  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    decidedAt: Date.now(),
    analytics,
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Quota or a locked-down browser. The choice still holds for this session.
  }
}

function decide(analytics: boolean): void {
  persist(analytics);
  status.value = analytics ? 'accepted' : 'declined';
  isReopened.value = false;
}

function accept(): void {
  decide(true);
}

function decline(): void {
  decide(false);
}

/**
 * Brings the question back up from the footer or a settings screen. The stored
 * record is left untouched until a new choice is made, so a visitor who
 * changes their mind twice is never left without one.
 */
export function openCookieConsent(): void {
  // A cookieless provider has nothing to ask about: opening would show a banner
  // whose only outcome is turning off something that was never on.
  if (!isConsentRequired()) {
    return;
  }

  hydrate();
  isReopened.value = true;
}

export function useCookieConsent() {
  hydrate();

  // Constant for a build — it is derived from the env — but exposed as a
  // computed so templates and watchers consume it like the rest.
  const consentRequired = computed(() => isConsentRequired());

  return {
    status: readonly(status),
    isDecided: computed(() => status.value !== 'undecided'),
    analyticsAllowed: computed(() => status.value === 'accepted'),
    /** False under a cookieless provider: no banner, no footer control. */
    isConsentRequired: consentRequired,
    isBannerVisible: computed(
      () =>
        consentRequired.value &&
        (isReopened.value || status.value === 'undecided'),
    ),

    accept,
    decline,
    openConsent: openCookieConsent,
  };
}

/** Test seam: module scope would otherwise leak between cases. */
export function resetCookieConsentForTests(): void {
  hydrated = false;
  status.value = 'undecided';
  isReopened.value = false;
}
