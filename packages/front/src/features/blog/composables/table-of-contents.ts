import {
  type Ref,
  ref,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import {
  type TocHeading,
  READING_LINE,
  pickActiveHeading,
  readingFraction,
} from './article-toc';

// A programmatic scroll that never fires `scrollend` still releases the spy
const SCROLL_LOCK_FALLBACK_MS = 1200;

function prefersReducedMotion(): boolean {
  return (
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  );
}

function hashId(): string {
  const raw = globalThis.location?.hash.slice(1) ?? '';

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Scrollspy for the article contents: which section is being read, how far
 * through the body the reader is, and a way to jump to a section.
 */
export function useTableOfContents(
  headings: Ref<TocHeading[]>,
  body: Ref<HTMLElement | null>,
) {
  const activeId = ref<string | null>(null);
  const progress = ref(0);

  let targets: Array<{ id: string; el: HTMLElement }> = [];
  let observer: IntersectionObserver | null = null;
  let frame = 0;
  let locked = false;
  let lockTimer: ReturnType<typeof setTimeout> | undefined;

  function measure() {
    frame = 0;

    const container = body.value;

    if (!container || targets.length === 0) {
      return;
    }

    const viewport = globalThis.innerHeight;
    const line = viewport * READING_LINE;
    const rect = container.getBoundingClientRect();

    progress.value = readingFraction(rect.top, rect.height, line);

    if (locked) {
      return;
    }

    const doc = document.documentElement;
    const atEnd = globalThis.scrollY + viewport >= doc.scrollHeight - 2;
    const index = pickActiveHeading(
      targets.map(({ el }) => el.getBoundingClientRect().top),
      line,
      atEnd,
    );

    activeId.value = index === -1 ? null : targets[index].id;
  }

  function schedule() {
    if (!frame) {
      frame = requestAnimationFrame(measure);
    }
  }

  function unlock() {
    if (!locked) {
      return;
    }

    locked = false;
    clearTimeout(lockTimer);
    globalThis.removeEventListener('scrollend', unlock);
    globalThis.removeEventListener('wheel', unlock);
    globalThis.removeEventListener('touchstart', unlock);
    globalThis.removeEventListener('keydown', unlock);
    schedule();
  }

  // Hold the marker on the chosen entry while the page travels to it; any
  // input from the reader hands control straight back to the spy
  function lock() {
    unlock();
    locked = true;
    lockTimer = setTimeout(unlock, SCROLL_LOCK_FALLBACK_MS);
    globalThis.addEventListener('scrollend', unlock, { once: true });
    globalThis.addEventListener('wheel', unlock, { passive: true, once: true });
    globalThis.addEventListener('touchstart', unlock, {
      passive: true,
      once: true,
    });
    globalThis.addEventListener('keydown', unlock, { once: true });
  }

  function scrollToHeading(id: string) {
    const target = targets.find((t) => t.id === id)?.el;

    if (!target) {
      return;
    }

    activeId.value = id;
    lock();

    // Focus first without scrolling, so the smooth scroll is not cut short
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });

    // Shareable position without stacking history entries
    globalThis.history.replaceState(
      globalThis.history.state,
      '',
      `#${encodeURIComponent(id)}`,
    );
  }

  function teardown() {
    observer?.disconnect();
    observer = null;
    targets = [];

    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  function setup() {
    teardown();

    const container = body.value;

    if (!container || headings.value.length === 0) {
      activeId.value = null;
      progress.value = 0;

      return;
    }

    for (const heading of headings.value) {
      const el = container.querySelector<HTMLElement>(
        `#${CSS.escape(heading.id)}`,
      );

      if (el) {
        // Focusable from script only, so screen readers land on the section
        el.tabIndex = -1;
        targets.push({ id: heading.id, el });
      }
    }

    // A zero-height band on the reading line: every heading crossing it
    // re-runs the spy (the scroll listener covers jumps that skip the band)
    const above = READING_LINE * 100;

    observer = new IntersectionObserver(schedule, {
      rootMargin: `-${above}% 0px -${100 - above}% 0px`,
    });

    for (const { el } of targets) {
      observer.observe(el);
    }

    // Arriving on a shared #section link: land on it once the body exists
    const fromHash = hashId();
    const landing = targets.find((t) => t.id === fromHash)?.el;

    landing?.scrollIntoView({ block: 'start' });

    schedule();
  }

  // Browser only: the article is also prerendered
  onMounted(() => {
    globalThis.addEventListener('scroll', schedule, { passive: true });
    globalThis.addEventListener('resize', schedule, { passive: true });

    watch(
      [headings, body],
      async () => {
        await nextTick();
        setup();
      },
      { immediate: true, flush: 'post' },
    );
  });

  onBeforeUnmount(() => {
    unlock();
    teardown();
    globalThis.removeEventListener('scroll', schedule);
    globalThis.removeEventListener('resize', schedule);
  });

  return { activeId, progress, scrollToHeading };
}
