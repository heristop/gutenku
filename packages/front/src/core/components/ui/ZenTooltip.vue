<script lang="ts">
// Shared by every tooltip: once one has been open, the next one within this
// window opens at once and without animation, so scanning a row of icons
// does not wait on each label.
const WARM_WINDOW_MS = 400;
const warmth = { until: 0 };
</script>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick, useAttrs, watch } from 'vue';

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
    /** Trigger spans its container (for full-width buttons and rows) */
    block?: boolean;
  }>(),
  {
    position: 'top',
    delay: 200,
    disabled: false,
    block: false,
  },
);

const isVisible = ref(false);
// Opened inside the warm window: skip the CSS transition
const isInstant = ref(false);
const isTouchDevice = ref(false);
const triggerId = `zen-tooltip-trigger-${Math.random().toString(36).slice(2, 9)}`;
const tooltipId = `zen-tooltip-${Math.random().toString(36).slice(2, 9)}`;
const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const tooltipStyle = ref<Record<string, string>>({});

let showTimeout: ReturnType<typeof setTimeout> | null = null;
let hideTimeout: ReturnType<typeof setTimeout> | null = null;
let longPressTimeout: ReturnType<typeof setTimeout> | null = null;
const LONG_PRESS_DELAY = 500;
// Set when the trigger is pressed: the tooltip has done its job and must not
// come back over whatever the press opened, until the pointer or focus leaves.
let suppressed = false;

function show() {
  if (props.disabled || suppressed) {
    return;
  }

  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  const warm = Date.now() < warmth.until;

  showTimeout = setTimeout(
    () => {
      isInstant.value = warm;
      isVisible.value = true;
      nextTick(updatePosition);
    },
    warm ? 0 : props.delay,
  );
}

watch(isVisible, (visible) => {
  if (!visible) {
    warmth.until = Date.now() + WARM_WINDOW_MS;
  }
});

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
  if (!isTouchDevice.value || !isVisible.value) {
    return;
  }

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
  if (!triggerRef.value || !tooltipRef.value) {
    return;
  }

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
  left = Math.max(
    padding,
    Math.min(left, globalThis.innerWidth - tooltipRect.width - padding),
  );
  top = Math.max(
    padding,
    Math.min(top, globalThis.innerHeight - tooltipRect.height - padding),
  );

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

function hideNow() {
  if (showTimeout) {
    clearTimeout(showTimeout);
    showTimeout = null;
  }

  clearLongPressTimeout();
  isVisible.value = false;
}

function handlePress() {
  suppressed = true;
  hideNow();
}

function handleMouseLeave() {
  suppressed = false;
  hide();
}

function handleFocusIn() {
  show();
}

function handleFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null;

  if (next && triggerRef.value?.contains(next)) {
    return;
  }

  suppressed = false;
  hideNow();
}

function handleTouchStart() {
  if (!isTouchDevice.value || props.disabled) {
    return;
  }

  longPressTimeout = setTimeout(() => show(), LONG_PRESS_DELAY);
}

function clearLongPressTimeout() {
  if (longPressTimeout) {
    clearTimeout(longPressTimeout);
    longPressTimeout = null;
  }
}

function handleTouchEnd() {
  clearLongPressTimeout();
}

function handleTouchMove() {
  clearLongPressTimeout();
}

onMounted(() => {
  isTouchDevice.value =
    'ontouchstart' in globalThis || navigator.maxTouchPoints > 0;

  globalThis.addEventListener('scroll', updatePosition, { passive: true });
  globalThis.addEventListener('resize', updatePosition, { passive: true });

  // Click outside listener for mobile dismiss
  document.addEventListener('touchstart', handleClickOutside, {
    passive: true,
  });
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  globalThis.removeEventListener('scroll', updatePosition);
  globalThis.removeEventListener('resize', updatePosition);
  document.removeEventListener('touchstart', handleClickOutside);
  document.removeEventListener('click', handleClickOutside);

  if (showTimeout) {
    clearTimeout(showTimeout);
  }

  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }

  if (longPressTimeout) {
    clearTimeout(longPressTimeout);
  }
});
</script>

<template>
  <span
    :id="triggerId"
    ref="triggerRef"
    class="zen-tooltip-trigger"
    :class="{ 'zen-tooltip-trigger--block': block }"
    :aria-describedby="isVisible && !disabled ? tooltipId : undefined"
    v-bind="attrs"
    @mouseenter="!isTouchDevice && show()"
    @mouseleave="!isTouchDevice && handleMouseLeave()"
    @pointerdown="handlePress"
    @click="handlePress"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
    @touchmove.passive="handleTouchMove"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
    @keydown="handleKeydown"
  >
    <slot />
  </span>

  <Teleport to="body">
    <Transition :name="`zen-tooltip-${position}`" :css="!isInstant">
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
// Ex Libris: a typed label in inverted ink. Hard edge, no blur, no bounce.
.zen-tooltip-trigger {
  display: inline-block;

  &--block {
    display: block;
    width: 100%;
  }
}

.zen-tooltip {
  position: fixed;
  z-index: 10000;
  max-width: 280px;
  pointer-events: auto;

  &__content {
    position: relative;
    display: block;
    padding: 0.4375rem 0.625rem;
    background: var(--gk-ink);
    border-radius: var(--gk-radius-control);
    font-family: var(--gk-font);
    font-size: 0.8rem;
    line-height: 1.4;
    color: var(--gk-paper);
    text-align: center;
  }

  &__arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--gk-ink);
    transform: rotate(45deg);
  }

  &--top .zen-tooltip__arrow {
    bottom: -4px;
    left: 50%;
    margin-left: -4px;
  }

  &--bottom .zen-tooltip__arrow {
    top: -4px;
    left: 50%;
    margin-left: -4px;
  }

  &--left .zen-tooltip__arrow {
    right: -4px;
    top: 50%;
    margin-top: -4px;
  }

  &--right .zen-tooltip__arrow {
    left: -4px;
    top: 50%;
    margin-top: -4px;
  }
}

.zen-tooltip-top-enter-active {
  transition:
    opacity var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-fast) var(--gk-ease-out);
}

.zen-tooltip-top-leave-active {
  transition:
    opacity var(--gk-dur-press) var(--gk-ease-out),
    transform var(--gk-dur-press) var(--gk-ease-out);
}

.zen-tooltip-top-enter-from,
.zen-tooltip-top-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.zen-tooltip-bottom-enter-active {
  transition:
    opacity var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-fast) var(--gk-ease-out);
}

.zen-tooltip-bottom-leave-active {
  transition:
    opacity var(--gk-dur-press) var(--gk-ease-out),
    transform var(--gk-dur-press) var(--gk-ease-out);
}

.zen-tooltip-bottom-enter-from,
.zen-tooltip-bottom-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.zen-tooltip-left-enter-active {
  transition:
    opacity var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-fast) var(--gk-ease-out);
}

.zen-tooltip-left-leave-active {
  transition:
    opacity var(--gk-dur-press) var(--gk-ease-out),
    transform var(--gk-dur-press) var(--gk-ease-out);
}

.zen-tooltip-left-enter-from,
.zen-tooltip-left-leave-to {
  opacity: 0;
  transform: translateX(4px);
}

.zen-tooltip-right-enter-active {
  transition:
    opacity var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-fast) var(--gk-ease-out);
}

.zen-tooltip-right-leave-active {
  transition:
    opacity var(--gk-dur-press) var(--gk-ease-out),
    transform var(--gk-dur-press) var(--gk-ease-out);
}

.zen-tooltip-right-enter-from,
.zen-tooltip-right-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}

@media (max-width: 480px) {
  .zen-tooltip {
    max-width: min(280px, calc(100dvw - 2rem));

    &__content {
      font-size: 0.75rem;
      padding: 0.375rem 0.5625rem;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-tooltip-top-enter-from,
  .zen-tooltip-top-leave-to,
  .zen-tooltip-bottom-enter-from,
  .zen-tooltip-bottom-leave-to,
  .zen-tooltip-left-enter-from,
  .zen-tooltip-left-leave-to,
  .zen-tooltip-right-enter-from,
  .zen-tooltip-right-leave-to {
    transform: none;
  }
}

@media (forced-colors: active) {
  .zen-tooltip__content {
    border: 1px solid CanvasText;
  }
}
</style>
