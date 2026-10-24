<script lang="ts" setup>
withDefaults(
  defineProps<{
    duration?: number;
  }>(),
  {
    duration: 300,
  },
);

function onEnter(el: Element, done: () => void) {
  const element = el as HTMLElement;
  element.style.overflow = 'hidden';
  element.style.height = '0';

  const _ = element.offsetHeight; // trigger reflow

  element.style.height = `${element.scrollHeight}px`;

  const onEnd = () => {
    element.style.height = '';
    element.style.overflow = '';
    element.removeEventListener('transitionend', onEnd);
    done();
  };
  element.addEventListener('transitionend', onEnd);
}

function onLeave(el: Element, done: () => void) {
  const element = el as HTMLElement;
  element.style.overflow = 'hidden';
  element.style.height = `${element.scrollHeight}px`;

  const _ = element.offsetHeight; // trigger reflow

  element.style.height = '0';

  const onEnd = () => {
    element.removeEventListener('transitionend', onEnd);
    done();
  };
  element.addEventListener('transitionend', onEnd);
}
</script>

<template>
  <Transition name="zen-expand" @enter="onEnter" @leave="onLeave">
    <slot />
  </Transition>
</template>

<style lang="scss">
// Ex Libris: a fold opens with an ease-out, no overshoot and no blur.
.zen-expand-enter-active,
.zen-expand-leave-active {
  transition:
    height var(--gk-dur-base) var(--gk-ease-out),
    opacity var(--gk-dur-base) var(--gk-ease-out),
    transform var(--gk-dur-base) var(--gk-ease-out);
}

.zen-expand-enter-from,
.zen-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.zen-expand-enter-to,
.zen-expand-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .zen-expand-enter-active,
  .zen-expand-leave-active {
    transition: opacity 150ms linear;
    transform: none !important;
  }
}
</style>
