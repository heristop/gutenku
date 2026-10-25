// One owner for document.startViewTransition. Route changes and theme switches
// both go through here, so a second transition never starts on top of a first
// one: that is what threw "Transition was aborted because of invalid state" and
// "Transition was skipped" on fast clicks.

export type ViewTransitionKind = 'page' | 'theme';

interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    update: () => void | Promise<void>,
  ) => ViewTransitionLike;
};

let active: ViewTransitionLike | null = null;

const ignore = (): void => {};

export const prefersReducedMotion = (): boolean =>
  typeof globalThis.matchMedia === 'function' &&
  globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The API exists, and the reader has not asked for less motion. A theme
// change still crossfades under reduced motion: a brightness cut is the
// harsher change (it becomes a plain fade in CSS)
export const supportsViewTransition = (
  kind: ViewTransitionKind = 'page',
): boolean => {
  if (import.meta.env.SSR || typeof document === 'undefined') {
    return false;
  }

  return (
    typeof (document as DocumentWithViewTransition).startViewTransition ===
      'function' &&
    (kind === 'theme' || !prefersReducedMotion())
  );
};

export const isViewTransitionRunning = (): boolean => active !== null;

/** Jump the running transition (if any) to its end state. */
export function skipActiveViewTransition(): void {
  active?.skipTransition();
}

/**
 * Apply `update` inside a view transition when one can start cleanly, and
 * directly otherwise (no support, reduced motion, hidden tab, or another
 * transition in flight, which is finished at once instead of aborted).
 * `kind` lands on <html data-gk-vt> so CSS can style page and theme changes
 * apart. Resolves once the DOM update has run; never rejects for animation.
 */
export interface ViewTransitionOptions {
  /** Runs once the snapshots exist, to drive a custom animation */
  onReady?: (transition: ViewTransitionLike) => void;
}

export function runViewTransition(
  update: () => void | Promise<void>,
  kind: ViewTransitionKind,
  options: ViewTransitionOptions = {},
): Promise<void> {
  if (
    !supportsViewTransition(kind) ||
    document.visibilityState === 'hidden' ||
    active
  ) {
    skipActiveViewTransition();

    return Promise.resolve(update());
  }

  const root = document.documentElement;
  root.dataset.gkVt = kind;

  let transition: ViewTransitionLike;

  try {
    transition = (
      document as Required<DocumentWithViewTransition>
    ).startViewTransition(update);
  } catch {
    delete root.dataset.gkVt;

    return Promise.resolve(update());
  }

  if (!transition?.finished) {
    delete root.dataset.gkVt;

    return Promise.resolve();
  }

  active = transition;
  // Skipped or aborted transitions reject these: an animation that did not
  // play is not an error worth surfacing.
  transition.ready.then(() => options.onReady?.(transition)).catch(ignore);
  transition.finished.catch(ignore).finally(() => {
    if (active === transition) {
      active = null;
      delete root.dataset.gkVt;
    }
  });

  return transition.updateCallbackDone.catch(ignore);
}

/** Kept for callers that only need "animate if you can". */
export const withViewTransition = (callback: () => void): void => {
  runViewTransition(callback, 'page');
};

// Set by the layout on the first client-side page change. Lets a view tell a
// fresh document load (play its entrance) from an in-app visit (do not).
let pageNavigated = false;

export const markPageNavigated = (): void => {
  pageNavigated = true;
};

export const hasPageNavigated = (): boolean => pageNavigated;
