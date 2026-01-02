<script lang="ts" setup>
import { computed, ref, watch, useId, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import { useExpandedState } from '@/core/composables/local-storage';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    icon?: Component;
    title: string;
    subtitle?: string;
    storageKey?: string;
    defaultExpanded?: boolean;
    ariaLabel?: string;
  }>(),
  {
    subtitle: '',
    defaultExpanded: true,
  },
);

const modelValue = defineModel<boolean>();

// Generate unique IDs for accessibility
const baseId = useId();
const headerId = `zen-accordion-header-${baseId}`;
const contentId = `zen-accordion-content-${baseId}`;

// Use storage-backed state if storageKey provided, otherwise use modelValue
const storageState = props.storageKey
  ? useExpandedState(props.storageKey, props.defaultExpanded)
  : null;

const isExpanded = computed({
  get: () => modelValue.value ?? storageState?.value.value ?? props.defaultExpanded,
  set: (val: boolean) => {
    if (modelValue.value !== undefined) {
      modelValue.value = val;
    }
    if (storageState) {
      storageState.value.value = val;
    }
  },
});

const toggleTooltip = computed(() =>
  isExpanded.value ? t('common.collapse') : t('common.expand'),
);

function toggle() {
  isExpanded.value = !isExpanded.value;
}

// Handle keyboard navigation (WCAG 2.1.1)
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggle();
  }
}

// Mouse position tracking for ink wash effect
const headerRef = ref<HTMLButtonElement | null>(null);
const mouseX = ref('50%');
const mouseY = ref('50%');

function handleMouseMove(event: MouseEvent) {
  if (!headerRef.value) {return;}
  const rect = headerRef.value.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  mouseX.value = `${x}%`;
  mouseY.value = `${y}%`;
}

// Ink ripple effect on click
const inkRipple = ref<{ x: number; y: number; active: boolean }>({
  x: 0,
  y: 0,
  active: false,
});

function handleClick(event: MouseEvent) {
  if (!headerRef.value) {return;}
  const rect = headerRef.value.getBoundingClientRect();
  inkRipple.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    active: true,
  };

  setTimeout(() => {
    inkRipple.value.active = false;
  }, 600);

  toggle();
}

// Emit expanded state changes
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  toggle: [expanded: boolean];
}>();

watch(isExpanded, (val) => {
  emit('update:modelValue', val);
  emit('toggle', val);
});
</script>

<template>
  <div class="zen-accordion">
    <!-- Header Row (contains button + separate actions) -->
    <div class="zen-accordion__header-row">
      <!-- Header / Toggle Button -->
      <button
        :id="headerId"
        ref="headerRef"
        type="button"
        class="zen-accordion__header"
        :class="{ 'zen-accordion__header--expanded': isExpanded }"
        :style="{ '--mouse-x': mouseX, '--mouse-y': mouseY }"
        :aria-expanded="isExpanded"
        :aria-controls="contentId"
        :aria-label="ariaLabel || title"
        @click="handleClick"
        @keydown="handleKeydown"
        @mousemove="handleMouseMove"
      >
        <!-- Ink wash hover effect -->
        <span class="zen-accordion__ink-wash" aria-hidden="true" />

        <!-- Ink ripple on click -->
        <span
          v-if="inkRipple.active"
          class="zen-accordion__ink-ripple"
          :style="{ left: `${inkRipple.x}px`, top: `${inkRipple.y}px` }"
          aria-hidden="true"
        />

        <!-- Icon slot or prop -->
        <span
          v-if="icon || $slots.icon"
          class="zen-accordion__icon"
          aria-hidden="true"
        >
          <slot name="icon">
            <component :is="icon" :size="28" />
          </slot>
        </span>

        <!-- Title & Subtitle -->
        <span class="zen-accordion__header-content">
          <span class="zen-accordion__title">{{ title }}</span>
          <span
            v-if="subtitle || $slots.subtitle"
            class="zen-accordion__subtitle"
          >
            <slot name="subtitle">{{ subtitle }}</slot>
          </span>
        </span>

        <!-- Ink Brush Toggle Icon (+/-) -->
        <ZenTooltip :text="toggleTooltip" position="top">
          <span class="zen-accordion__toggle" aria-hidden="true">
            <svg
              class="zen-accordion__toggle-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <!-- Horizontal stroke (always visible) -->
              <path
                class="zen-accordion__stroke zen-accordion__stroke--horizontal"
                d="M5 12 Q12 11.5 19 12"
              />
              <!-- Vertical stroke (fades when expanded) -->
              <path
                class="zen-accordion__stroke zen-accordion__stroke--vertical"
                :class="{ 'zen-accordion__stroke--hidden': isExpanded }"
                d="M12 5 Q11.5 12 12 19"
              />
            </svg>
          </span>
        </ZenTooltip>
      </button>

      <!-- Header Actions Slot (outside button to avoid nested-interactive) -->
      <div v-if="$slots.actions" class="zen-accordion__actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Collapsible Content -->
    <div
      :id="contentId"
      class="zen-accordion__content"
      :class="{ 'zen-accordion__content--expanded': isExpanded }"
      role="region"
      :aria-labelledby="headerId"
      :hidden="!isExpanded"
    >
      <div class="zen-accordion__content-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Spring easing for organic feel
$spring-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
$ink-easing: cubic-bezier(0.22, 1, 0.36, 1);

.zen-accordion {
  --zen-accordion-radius: var(--gutenku-radius-sm);
  --zen-accordion-transition: 0.35s #{$ink-easing};

  width: 100%;
}

// Header Row (button + actions container)
.zen-accordion__header-row {
  display: flex;
  align-items: center;
  width: 100%;
}

// Header / Toggle Button
.zen-accordion__header {
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: var(--zen-accordion-radius);
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  overflow: hidden;
  transition:
    background var(--zen-accordion-transition),
    box-shadow var(--zen-accordion-transition),
    transform 0.15s ease;

  // WCAG 2.5.8: Minimum 44x44px touch target
  min-height: 44px;

  // WCAG 2.4.7 & 2.4.11: Focus visible with sufficient contrast
  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-primary);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px color-mix(in oklch, var(--gutenku-zen-primary) 20%, transparent);
  }

  &:hover {
    .zen-accordion__ink-wash {
      opacity: 1;
    }
  }

  // Subtle lift on active state
  &:active {
    transform: scale(0.995);
  }
}

// Ink wash hover effect (follows cursor)
.zen-accordion__ink-wash {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    color-mix(in oklch, var(--gutenku-zen-primary) 8%, transparent) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
  border-radius: inherit;
}

// Ink ripple on click
.zen-accordion__ink-ripple {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--gutenku-zen-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0.4;
  animation: ink-ripple-expand 0.6s $ink-easing forwards;
  pointer-events: none;
}

@keyframes ink-ripple-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(40);
    opacity: 0;
  }
}

// Icon
.zen-accordion__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--gutenku-zen-primary);
}

// Header content
.zen-accordion__header-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
}

.zen-accordion__title {
  font-family: 'JMH Typewriter', monospace;
  font-size: 1rem;
  font-weight: 500;
  color: var(--gutenku-text-primary);
  letter-spacing: 0.025em;
}

.zen-accordion__subtitle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--gutenku-text-muted);
  margin-top: 0.125rem;
}

// Header actions slot
.zen-accordion__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

// Toggle icon (+/-)
.zen-accordion__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: var(--gutenku-zen-primary);
  transition: transform 0.3s $spring-easing;

  // Subtle wobble on state change
  .zen-accordion__header--expanded & {
    animation: toggle-wobble 0.4s $spring-easing;
  }
}

@keyframes toggle-wobble {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(3deg);
  }
  50% {
    transform: rotate(-2deg);
  }
  75% {
    transform: rotate(1deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.zen-accordion__toggle-svg {
  width: 100%;
  height: 100%;
}

.zen-accordion__stroke {
  transition:
    opacity var(--zen-accordion-transition),
    transform var(--zen-accordion-transition),
    stroke-dashoffset 0.4s $ink-easing;

  // Hand-drawn ink effect
  stroke-dasharray: 20;
  stroke-dashoffset: 0;

  &--horizontal {
    // Ink bleed effect on toggle
    .zen-accordion__header--expanded & {
      animation: ink-bleed-horizontal 0.5s $ink-easing;
    }
  }

  &--vertical {
    transform-origin: center;

    // Ink absorb effect when collapsing
    .zen-accordion__header:not(.zen-accordion__header--expanded) & {
      animation: ink-draw-vertical 0.4s $ink-easing;
    }
  }

  &--hidden {
    opacity: 0;
    transform: scaleY(0);
    stroke-dashoffset: 20;
  }
}

@keyframes ink-bleed-horizontal {
  0% {
    stroke-dashoffset: 20;
  }
  50% {
    stroke-dashoffset: 5;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes ink-draw-vertical {
  0% {
    stroke-dashoffset: 20;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

// Collapsible Content
.zen-accordion__content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--zen-accordion-transition);

  &--expanded {
    grid-template-rows: 1fr;
  }

  // Hidden attribute for accessibility (screen readers)
  &[hidden] {
    display: grid; // Override hidden to allow animation
  }
}

.zen-accordion__content-inner {
  overflow: hidden;
  opacity: 0;
  filter: blur(6px);
  transform: translateY(-12px) scale(0.98);
  transition:
    opacity 0.35s $ink-easing 0.08s,
    filter 0.3s $ink-easing 0.1s,
    transform 0.35s $spring-easing 0.05s;

  .zen-accordion__content--expanded & {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0) scale(1);
  }
}

// Dark theme
[data-theme='dark'] {
  .zen-accordion__header {
    &:focus-visible {
      outline-color: var(--gutenku-zen-accent);
      box-shadow: 0 0 0 4px color-mix(in oklch, var(--gutenku-zen-accent) 25%, transparent);
    }
  }

  .zen-accordion__ink-wash {
    background: radial-gradient(
      circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      color-mix(in oklch, var(--gutenku-zen-accent) 12%, transparent) 0%,
      transparent 60%
    );
  }

  .zen-accordion__ink-ripple {
    background: var(--gutenku-zen-accent);
    opacity: 0.3;
  }

  .zen-accordion__icon,
  .zen-accordion__toggle {
    color: var(--gutenku-zen-accent);
  }

  .zen-accordion__title {
    color: var(--gutenku-text-primary);
  }

  .zen-accordion__subtitle {
    color: var(--gutenku-text-muted);
  }
}

// Reduced motion (WCAG 2.3.3)
@media (prefers-reduced-motion: reduce) {
  .zen-accordion {
    --zen-accordion-transition: 0s;
  }

  .zen-accordion__ink-wash {
    transition: none;
  }

  .zen-accordion__ink-ripple {
    animation: none;
    display: none;
  }

  .zen-accordion__toggle {
    transition: none;
    animation: none !important;
  }

  .zen-accordion__stroke {
    transition: none;
    animation: none !important;
    stroke-dasharray: none;
    stroke-dashoffset: 0 !important;
  }

  .zen-accordion__content-inner {
    transition: none;
    filter: none;
    transform: none;
  }

  .zen-accordion__content {
    transition: none;

    &:not(&--expanded) .zen-accordion__content-inner {
      opacity: 0;
    }

    &--expanded .zen-accordion__content-inner {
      opacity: 1;
    }
  }
}

// High contrast mode
@media (forced-colors: active) {
  .zen-accordion__header {
    border: 1px solid ButtonText;

    &:focus-visible {
      outline: 3px solid Highlight;
      outline-offset: 2px;
    }
  }

  .zen-accordion__ink-wash {
    display: none;
  }

  .zen-accordion__stroke {
    stroke: ButtonText;
  }
}

// Mobile adjustments
@media (max-width: 600px) {
  .zen-accordion__title {
    font-size: 0.9rem;
  }

  .zen-accordion__subtitle {
    font-size: 0.8rem;
  }
}
</style>
