// Check if View Transition API is supported and user allows motion
export const supportsViewTransition = (): boolean => {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
};

// Run callback with View Transition API if available
export const withViewTransition = (callback: () => void): void => {
  if (supportsViewTransition()) {
    (
      document as Document & { startViewTransition: (cb: () => void) => void }
    ).startViewTransition(callback);
  } else {
    callback();
  }
};
