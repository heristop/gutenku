import { onBeforeUnmount, onMounted, type Ref } from 'vue';

// Scroll choreography for a long page, in both directions. Each `[data-reveal]`
// descendant is marked with where it stands against the viewport:
//   below  not reached yet (scrolling down brings it in; scrolling up sends it back)
//   in     on screen
//   above  already read (scrolling up brings it back in from above)
// The page's CSS decides what each state looks like. `--read` (0 to 1) on the
// root follows how much of the page has been read. Nothing is hidden before
// mount (prerendered text is always readable) or when motion is reduced.

export type RevealState = 'below' | 'in' | 'above';

const ATTR = 'data-reveal-state';

function stateOf(rect: DOMRect): RevealState {
  if (rect.top >= globalThis.innerHeight * 0.92) {
    return 'below';
  }

  if (rect.bottom <= globalThis.innerHeight * 0.08) {
    return 'above';
  }

  return 'in';
}

export function useScrollReveal(root: Ref<HTMLElement | null>): void {
  let observer: IntersectionObserver | undefined;
  let frame = 0;
  let targets: HTMLElement[] = [];

  // A jump (anchor, back button, End key) can carry an element clean across the
  // viewport without the observer seeing it cross: what was "above" is now below.
  // Elements that are not on screen are put right again; "in" is the observer's.
  function reconcile(): void {
    for (const target of targets) {
      const current = target.getAttribute(ATTR);

      if (current === 'in') {
        continue;
      }

      const next = stateOf(target.getBoundingClientRect());

      if (next !== 'in' && next !== current) {
        target.setAttribute(ATTR, next);
      }
    }
  }

  function updateProgress(): void {
    frame = 0;
    const el = root.value;

    if (!el) {
      return;
    }

    const rect = el.getBoundingClientRect();
    const span = rect.height - globalThis.innerHeight;
    const read = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;

    el.style.setProperty('--read', read.toFixed(4));
    reconcile();
  }

  function schedule(): void {
    if (!frame) {
      frame = requestAnimationFrame(updateProgress);
    }
  }

  onMounted(() => {
    const el = root.value;

    if (!el) {
      return;
    }

    updateProgress();
    globalThis.addEventListener('scroll', schedule, { passive: true });
    globalThis.addEventListener('resize', schedule, { passive: true });

    targets = [...el.querySelectorAll<HTMLElement>('[data-reveal]')];
    const reduced = globalThis.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reduced || !('IntersectionObserver' in globalThis)) {
      for (const target of targets) {
        target.setAttribute(ATTR, 'in');
      }

      return;
    }

    // Set every state before arming, so what is already on screen never flashes
    for (const target of targets) {
      target.setAttribute(ATTR, stateOf(target.getBoundingClientRect()));
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.setAttribute(
            ATTR,
            entry.isIntersecting ? 'in' : stateOf(entry.boundingClientRect),
          );
        }
      },
      { rootMargin: '-8% 0px -8% 0px', threshold: [0, 0.15] },
    );

    for (const target of targets) {
      observer.observe(target);
    }

    el.setAttribute('data-reveal-armed', '');
  });

  onBeforeUnmount(() => {
    // Nothing was set up on the server, so there is nothing to undo there
    if (typeof globalThis.removeEventListener !== 'function') {
      return;
    }

    observer?.disconnect();

    if (frame) {
      cancelAnimationFrame(frame);
    }

    globalThis.removeEventListener('scroll', schedule);
    globalThis.removeEventListener('resize', schedule);
  });
}
