<script lang="ts" setup>
// A fold that opens like a drawer: the space grows from nothing (height,
// padding and margin together, so nothing jumps at either end), then the
// content inks in once there is room. Closing is quicker and starts from
// wherever the fold is, so a second tap mid-way simply turns it round.
import { prefersReducedMotion } from '@/core/composables/view-transition';

const OPEN_MS = 300;
const CLOSE_MS = 200;
// The drawer curve: fast out of the gate, a long soft settle
const SPACE_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const INK_EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
// The content waits a beat for its room on the way in
const INK_DELAY_MS = 60;

type Fold = HTMLElement & { zenExpand?: Animation[] };
type Box = Record<'height' | SpaceSide, string>;
type SpaceSide = 'paddingTop' | 'paddingBottom' | 'marginTop' | 'marginBottom';

const SIDES: SpaceSide[] = [
  'paddingTop',
  'paddingBottom',
  'marginTop',
  'marginBottom',
];

function box(el: HTMLElement): Box {
  const style = getComputedStyle(el);
  const sides = Object.fromEntries(
    SIDES.map((side) => [side, style[side]]),
  ) as Record<SpaceSide, string>;

  return { height: `${el.getBoundingClientRect().height}px`, ...sides };
}

const CLOSED: Box = {
  height: '0px',
  paddingTop: '0px',
  paddingBottom: '0px',
  marginTop: '0px',
  marginBottom: '0px',
};

// Whatever is running is stopped where it stands (its current values read
// first by the caller), so the next motion starts from there
function stop(el: Fold): void {
  el.zenExpand?.forEach((animation) => animation.cancel());
  el.zenExpand = undefined;
}

function canAnimate(el: HTMLElement): boolean {
  return typeof el.animate === 'function';
}

function onEnter(el: Element, done: () => void): void {
  const fold = el as Fold;

  if (!canAnimate(fold)) {
    done();

    return;
  }

  // Interrupting a close: open from the height it had reached
  const from = fold.zenExpand ? box(fold) : CLOSED;
  stop(fold);
  const to = box(fold);

  if (prefersReducedMotion()) {
    const fade = fold.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 150,
      easing: 'linear',
    });
    fold.zenExpand = [fade];
    fade.onfinish = () => done();

    return;
  }

  fold.style.overflow = 'hidden';
  const space = fold.animate([from, to], {
    duration: OPEN_MS,
    easing: SPACE_EASE,
  });
  const ink = fold.animate(
    [
      { opacity: 0, transform: 'translateY(-4px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    {
      duration: OPEN_MS - INK_DELAY_MS,
      delay: INK_DELAY_MS,
      easing: INK_EASE,
      fill: 'backwards',
    },
  );
  fold.zenExpand = [space, ink];
  space.onfinish = () => {
    fold.style.overflow = '';
    fold.zenExpand = undefined;
    done();
  };
}

function onLeave(el: Element, done: () => void): void {
  const fold = el as Fold;

  if (!canAnimate(fold)) {
    done();

    return;
  }

  const from = box(fold);
  const opacity = getComputedStyle(fold).opacity;
  stop(fold);

  if (prefersReducedMotion()) {
    const fade = fold.animate([{ opacity }, { opacity: 0 }], {
      duration: 150,
      easing: 'linear',
    });
    fold.zenExpand = [fade];
    fade.onfinish = () => done();

    return;
  }

  fold.style.overflow = 'hidden';
  const space = fold.animate([from, CLOSED], {
    duration: CLOSE_MS,
    easing: SPACE_EASE,
  });
  const ink = fold.animate([{ opacity }, { opacity: 0 }], {
    duration: CLOSE_MS * 0.6,
    easing: INK_EASE,
    fill: 'forwards',
  });
  fold.zenExpand = [space, ink];
  space.onfinish = () => {
    fold.zenExpand = undefined;
    done();
  };
}
</script>

<template>
  <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <slot />
  </Transition>
</template>
