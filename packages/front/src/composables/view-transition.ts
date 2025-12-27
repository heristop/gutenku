/**
 * View Transition API support detection (respects user motion preferences)
 */
export const supportsViewTransition = (): boolean => {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
};

/**
 * Runs callback with View Transition API when available
 */
export const withViewTransition = (callback: () => void): void => {
  if (supportsViewTransition()) {
    (
      document as Document & { startViewTransition: (cb: () => void) => void }
    ).startViewTransition(callback);
  } else {
    callback();
  }
};
