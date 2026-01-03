<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick, useAttrs } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();

type Position = 'top' | 'bottom' | 'left' | 'right';

const props = withDefaults(
  defineProps<{
    text: string;
    position?: Position;
    delay?: number;
    disabled?: boolean;
  }>(),
  {
    position: 'top',
    delay: 200,
    disabled: false,
  }
);

const isVisible = ref(false);
const isTouchDevice = ref(false);
const triggerId = `zen-tooltip-trigger-${Math.random().toString(36).slice(2, 9)}`;
const tooltipId = `zen-tooltip-${Math.random().toString(36).slice(2, 9)}`;
const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const tooltipStyle = ref<Record<string, string>>({});

let showTimeout: ReturnType<typeof setTimeout> | null = null;
let hideTimeout: ReturnType<typeof setTimeout> | null = null;

function show() {
  if (props.disabled) {return;}

  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  showTimeout = setTimeout(() => {
    isVisible.value = true;
    nextTick(updatePosition);
  }, props.delay);
}

function hide() {
  if (showTimeout) {
    clearTimeout(showTimeout);
    showTimeout = null;
  }

  hideTimeout = setTimeout(() => {
    isVisible.value = false;
  }, 100);
}

function handleClickOutside(event: MouseEvent | TouchEvent) {
  if (!isTouchDevice.value || !isVisible.value) {return;}

  const target = event.target as Node;
  if (
    triggerRef.value &&
    !triggerRef.value.contains(target) &&
    tooltipRef.value &&
    !tooltipRef.value.contains(target)
  ) {
    isVisible.value = false;
  }
}

function updatePosition() {
  if (!triggerRef.value || !tooltipRef.value) {return;}

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  const gap = 12;

  let top = 0;
  let left = 0;

  switch (props.position) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - gap;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      break;
    case 'bottom':
      top = triggerRect.bottom + gap;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      break;
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.left - tooltipRect.width - gap;
      break;
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.right + gap;
      break;
  }

  // Keep tooltip within viewport
  const padding = 8;
  left = Math.max(padding, Math.min(left, globalThis.innerWidth - tooltipRect.width - padding));
  top = Math.max(padding, Math.min(top, globalThis.innerHeight - tooltipRect.height - padding));

  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isVisible.value) {
    isVisible.value = false;
    event.preventDefault();
  }
}

function handleFocusIn() {
  show();
}

function handleFocusOut() {
  hide();
}

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in globalThis || navigator.maxTouchPoints > 0;

  globalThis.addEventListener('scroll', updatePosition, { passive: true });
  globalThis.addEventListener('resize', updatePosition, { passive: true });

  // Click outside listener for mobile dismiss
  document.addEventListener('touchstart', handleClickOutside, { passive: true });
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  globalThis.removeEventListener('scroll', updatePosition);
  globalThis.removeEventListener('resize', updatePosition);
  document.removeEventListener('touchstart', handleClickOutside);
  document.removeEventListener('click', handleClickOutside);
  if (showTimeout) {clearTimeout(showTimeout);}
  if (hideTimeout) {clearTimeout(hideTimeout);}
});
</script>

<template>
  <span
    :id="triggerId"
    ref="triggerRef"
    class="zen-tooltip-trigger"
    :aria-describedby="isVisible && !disabled ? tooltipId : undefined"
    v-bind="attrs"
    @mouseenter="!isTouchDevice && show()"
    @mouseleave="!isTouchDevice && hide()"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
    @keydown="handleKeydown"
  >
    <slot />
  </span>

  <Teleport to="body">
    <Transition :name="`zen-tooltip-${position}`">
      <div
        v-if="isVisible && !disabled"
        :id="tooltipId"
        ref="tooltipRef"
        class="zen-tooltip"
        :class="`zen-tooltip--${position}`"
        :style="tooltipStyle"
        role="tooltip"
        aria-hidden="false"
        @mouseenter="show"
        @mouseleave="hide"
      >
        <span class="zen-tooltip__content">{{ text }}</span>
        <span class="zen-tooltip__arrow" aria-hidden="true" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.zen-tooltip-trigger {
  display: inline-block;
}

.zen-tooltip {
  position: fixed;
  z-index: 10000;
  max-width: 280px;
  pointer-events: auto;

  &__content {
    position: relative;
    display: block;
    padding: 0.5rem 0.75rem;
    background:
      radial-gradient(ellipse at center, oklch(0.55 0.08 170 / 0.06) 0%, transparent 70%),
      var(--gutenku-paper-bg-aged);
    border: 1px solid var(--gutenku-paper-border);
    border-radius: var(--gutenku-radius-sm);
    box-shadow:
      0 4px 12px oklch(0 0 0 / 0.1),
      0 2px 4px oklch(0 0 0 / 0.06),
      inset 0 1px 0 oklch(1 0 0 / 0.5);
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.8rem;
    line-height: 1.4;
    color: var(--gutenku-text-primary);
    text-align: center;
    overflow: hidden;

    // Paper texture overlay
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
      border-radius: inherit;
    }
  }

  &__arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--gutenku-paper-bg-aged);
    border: 1px solid var(--gutenku-paper-border);
    transform: rotate(45deg);
  }

  &--top {
    .zen-tooltip__arrow {
      bottom: -4px;
      left: 50%;
      margin-left: -4px;
      border-top: none;
      border-left: none;
    }
  }

  &--bottom {
    .zen-tooltip__arrow {
      top: -4px;
      left: 50%;
      margin-left: -4px;
      border-bottom: none;
      border-right: none;
    }
  }

  &--left {
    .zen-tooltip__arrow {
      right: -4px;
      top: 50%;
      margin-top: -4px;
      border-bottom: none;
      border-left: none;
    }
  }

  &--right {
    .zen-tooltip__arrow {
      left: -4px;
      top: 50%;
      margin-top: -4px;
      border-top: none;
      border-right: none;
    }
  }
}

// Position-specific entry animations with directional slide + blur sharpen
.zen-tooltip-top-enter-active {
  animation: tooltip-slide-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.zen-tooltip-top-leave-active {
  animation: tooltip-slide-up-out 0.18s ease-in forwards;
}

.zen-tooltip-bottom-enter-active {
  animation: tooltip-slide-down 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.zen-tooltip-bottom-leave-active {
  animation: tooltip-slide-down-out 0.18s ease-in forwards;
}

.zen-tooltip-left-enter-active {
  animation: tooltip-slide-left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.zen-tooltip-left-leave-active {
  animation: tooltip-slide-left-out 0.18s ease-in forwards;
}

.zen-tooltip-right-enter-active {
  animation: tooltip-slide-right 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.zen-tooltip-right-leave-active {
  animation: tooltip-slide-right-out 0.18s ease-in forwards;
}

// Entry keyframes - directional slide + blur sharpen + scale bounce
@keyframes tooltip-slide-up {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
    filter: blur(4px);
  }
  70% {
    transform: translateY(-1px) scale(1.02);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes tooltip-slide-down {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
    filter: blur(4px);
  }
  70% {
    transform: translateY(1px) scale(1.02);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes tooltip-slide-left {
  0% {
    opacity: 0;
    transform: translateX(8px) scale(0.96);
    filter: blur(4px);
  }
  70% {
    transform: translateX(-1px) scale(1.02);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
}

@keyframes tooltip-slide-right {
  0% {
    opacity: 0;
    transform: translateX(-8px) scale(0.96);
    filter: blur(4px);
  }
  70% {
    transform: translateX(1px) scale(1.02);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
}

// Exit keyframes - reverse directional slide + slight blur
@keyframes tooltip-slide-up-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateY(4px) scale(0.98);
    filter: blur(2px);
  }
}

@keyframes tooltip-slide-down-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
    filter: blur(2px);
  }
}

@keyframes tooltip-slide-left-out {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateX(4px) scale(0.98);
    filter: blur(2px);
  }
}

@keyframes tooltip-slide-right-out {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-4px) scale(0.98);
    filter: blur(2px);
  }
}

// Dark theme
[data-theme='dark'] .zen-tooltip {
  &__content {
    background:
      radial-gradient(ellipse at center, oklch(0.5 0.06 170 / 0.08) 0%, transparent 70%),
      var(--gutenku-paper-bg);
    box-shadow:
      0 4px 16px oklch(0 0 0 / 0.4),
      0 2px 4px oklch(0 0 0 / 0.2),
      inset 0 1px 0 oklch(1 0 0 / 0.08);

    &::before {
      opacity: 0.04;
    }
  }

  &__arrow {
    background: var(--gutenku-paper-bg);
  }
}

// Mobile responsive
@media (max-width: 480px) {
  .zen-tooltip {
    // Use dvw (dynamic viewport) which excludes scrollbar, fallback to fixed px
    max-width: min(280px, calc(100dvw - 2rem));

    &__content {
      font-size: 0.75rem;
      padding: 0.4rem 0.6rem;
    }

    &__arrow {
      width: 6px;
      height: 6px;
    }

    &--top .zen-tooltip__arrow {
      bottom: -3px;
      margin-left: -3px;
    }

    &--bottom .zen-tooltip__arrow {
      top: -3px;
      margin-left: -3px;
    }

    &--left .zen-tooltip__arrow {
      right: -3px;
      margin-top: -3px;
    }

    &--right .zen-tooltip__arrow {
      left: -3px;
      margin-top: -3px;
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .zen-tooltip-top-enter-active,
  .zen-tooltip-top-leave-active,
  .zen-tooltip-bottom-enter-active,
  .zen-tooltip-bottom-leave-active,
  .zen-tooltip-left-enter-active,
  .zen-tooltip-left-leave-active,
  .zen-tooltip-right-enter-active,
  .zen-tooltip-right-leave-active {
    animation: none;
    transition: opacity 0.15s ease;
  }
}
</style>
