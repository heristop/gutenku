<script lang="ts" setup>
withDefaults(defineProps<{
  duration?: number;
}>(), {
  duration: 300,
});

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
$ink-easing: cubic-bezier(0.22, 1, 0.36, 1);
$spring-easing: cubic-bezier(0.34, 1.56, 0.64, 1);

.zen-expand-enter-active,
.zen-expand-leave-active {
  transition:
    height 0.3s $ink-easing,
    opacity 0.3s $ink-easing,
    filter 0.27s $ink-easing,
    transform 0.3s $spring-easing;
  will-change: height, opacity, filter, transform;
}

.zen-expand-enter-from {
  opacity: 0;
  filter: blur(6px);
  transform: translateY(-12px) scale(0.98);
}

.zen-expand-enter-to,
.zen-expand-leave-from {
  opacity: 1;
  filter: blur(0);
  transform: translateY(0) scale(1);
}

.zen-expand-leave-to {
  opacity: 0;
  filter: blur(6px);
  transform: translateY(-8px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .zen-expand-enter-active,
  .zen-expand-leave-active {
    transition: opacity 0.15s ease;
    filter: none !important;
    transform: none !important;
  }
}
</style>
