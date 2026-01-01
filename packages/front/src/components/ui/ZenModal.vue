<script lang="ts" setup>
import { computed, watch, onBeforeUnmount, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { X } from 'lucide-vue-next';

interface Props {
  maxWidth?: string | number;
  persistent?: boolean;
  showClose?: boolean;
  title?: string;
  contentClass?: string;
  variant?: 'default' | 'book' | 'help' | 'stats' | 'scroll';
  showDivider?: boolean;
  description?: string;
  lockBodyScroll?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 400,
  persistent: false,
  showClose: true,
  contentClass: '',
  variant: 'default',
  showDivider: false,
  description: '',
  lockBodyScroll: true,
});

const emit = defineEmits<{
  close: [];
}>();

const modelValue = defineModel<boolean>({ default: false });
const { t } = useI18n();

const modalRef = ref<HTMLElement | null>(null);
const previousActiveElement = ref<HTMLElement | null>(null);

const titleId = computed(() =>
  props.title ? `zen-modal-${props.title.toLowerCase().replaceAll(/\s+/g, '-')}` : undefined
);

const descriptionId = computed(() =>
  props.description ? `zen-modal-desc-${props.title?.toLowerCase().replaceAll(/\s+/g, '-') || 'modal'}` : undefined
);

const maxWidthStyle = computed(() =>
  typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
);

const modalClasses = computed(() => [
  'zen-modal',
  'gutenku-paper',
  props.contentClass,
  `zen-modal--${props.variant}`,
  { 'zen-modal--with-divider': props.showDivider },
]);

// WCAG 2.2: Get all focusable elements within the modal
function getFocusableElements(): HTMLElement[] {
  if (!modalRef.value) {return [];}

  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return [...modalRef.value.querySelectorAll<HTMLElement>(focusableSelectors)];
}

// WCAG 2.2: Trap focus within modal
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && !props.persistent) {
    e.preventDefault();
    close();
    return;
  }

  if (e.key === 'Tab') {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {return;}

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (e.shiftKey) {
      // Shift + Tab: Move backwards
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else if (document.activeElement === lastElement) {
      // Tab: Move forwards
      e.preventDefault();
      firstElement?.focus();
    }
  }
}

function close() {
  if (!props.persistent) {
    emit('close');
    modelValue.value = false;
  }
}

function handleOverlayClick(e: MouseEvent) {
  // Only close if clicking directly on overlay, not modal content
  if (e.target === e.currentTarget && !props.persistent) {
    close();
  }
}

// WCAG 2.2: Scroll lock for mobile compatibility
let scrollY = 0;

function lockScroll() {
  scrollY = globalThis.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.overflow = '';
  globalThis.scrollTo(0, scrollY);
}

watch(modelValue, async (isOpen) => {
  if (isOpen) {
    // Store the element that triggered the modal
    previousActiveElement.value = document.activeElement as HTMLElement;
    if (props.lockBodyScroll) {
      lockScroll();
    }
    document.addEventListener('keydown', handleKeydown);

    // WCAG 2.2: Move focus to first focusable element in modal
    await nextTick();
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      // If no focusable elements, focus the modal itself
      modalRef.value?.focus();
    }
  } else {
    document.removeEventListener('keydown', handleKeydown);
    if (props.lockBodyScroll) {
      unlockScroll();
    }

    // WCAG 2.2: Return focus to triggering element
    await nextTick();
    previousActiveElement.value?.focus();
    previousActiveElement.value = null;
  }
});

onBeforeUnmount(() => {
  if (modelValue.value) {
    document.removeEventListener('keydown', handleKeydown);
    if (props.lockBodyScroll) {
      unlockScroll();
    }
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="zen-modal">
      <div
        v-if="modelValue"
        class="zen-modal-overlay"
        role="presentation"
        @click="handleOverlayClick"
      >
        <div
          ref="modalRef"
          :class="modalClasses"
          :style="{ maxWidth: maxWidthStyle }"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          :aria-describedby="description ? descriptionId : undefined"
          tabindex="-1"
        >
          <!-- WCAG 2.2: Visible title for screen readers -->
          <h2 v-if="title" :id="titleId" class="sr-only">{{ title }}</h2>
          <!-- WCAG 2.2: Description for screen readers -->
          <p v-if="description" :id="descriptionId" class="sr-only">
            {{ description }}
          </p>

          <!-- WCAG 2.2: Close button with minimum 44x44 touch target -->
          <button
            v-if="showClose"
            type="button"
            class="zen-modal__close"
            :aria-label="t('common.close')"
            @click="close"
          >
            <X :size="20" aria-hidden="true" />
          </button>

          <div v-if="!!$slots.header" class="zen-modal__header">
            <slot name="header" />
          </div>

          <div class="zen-modal__content">
            <slot />
          </div>

          <div v-if="!!$slots.actions" class="zen-modal__actions">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
// Overlay with subtle backdrop blur
.zen-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: oklch(0 0 0 / 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

// Modal container with zen aesthetics
.zen-modal {
  position: relative;
  width: 100%;
  max-height: calc(100vh - 2rem);
  max-height: calc(100dvh - 2rem);
  padding: 1.5rem;
  overflow-y: auto;
  border-radius: var(--gutenku-radius-lg, 12px);

  // Subtle shadow for depth
  box-shadow:
    0 0 0 1px oklch(0 0 0 / 0.05),
    0 8px 24px oklch(0 0 0 / 0.12),
    0 24px 48px oklch(0 0 0 / 0.08);

  // WCAG 2.2: Ensure focus is visible when modal receives focus
  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-primary);
    outline-offset: 2px;
  }
}

// WCAG 2.2: Close button with 44x44 minimum touch target
.zen-modal__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;

  // WCAG 2.2: Minimum 44x44 touch target
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;

  background: transparent;
  border: none;
  border-radius: var(--gutenku-radius-full, 50%);
  color: var(--gutenku-text-secondary);
  cursor: pointer;

  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;

  &:hover {
    background: var(--gutenku-zen-water, oklch(0.85 0.02 200));
    color: var(--gutenku-text-primary);
  }

  &:active {
    transform: scale(0.95);
  }

  // WCAG 2.2: High contrast focus indicator
  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-primary);
    outline-offset: 2px;
    background: var(--gutenku-zen-water, oklch(0.85 0.02 200));
  }
}

.zen-modal__header {
  margin-bottom: 1rem;
  padding-right: 2.5rem; // Space for close button
}

.zen-modal__content {
  line-height: 1.6;
}

.zen-modal__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gutenku-paper-border, oklch(0.9 0.01 60));
}

// Variant: book - for book-related modals
.zen-modal--book {
  text-align: center;
}

// Variant: help - for help/info modals
.zen-modal--help {
  .zen-modal__content {
    font-size: 0.95rem;
  }
}

// Variant: stats - for statistics modals
.zen-modal--stats {
  .zen-modal__content {
    font-variant-numeric: tabular-nums;
  }
}

// Variant: scroll - for scrollable content modals
.zen-modal--scroll {
  .zen-modal__content {
    max-height: 60vh;
    max-height: 60dvh;
    overflow-y: auto;
    padding-right: 0.5rem;

    // Subtle scrollbar
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--gutenku-zen-mist);
      border-radius: 3px;
    }
  }
}

// With divider modifier
.zen-modal--with-divider {
  .zen-modal__header {
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--gutenku-paper-border, oklch(0.9 0.01 60));
  }
}

// Screen reader only text
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Transition animations - zen-inspired with subtle wow effect
.zen-modal-enter-active {
  transition:
    opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    backdrop-filter 0.5s ease-out;

  .zen-modal {
    transition:
      transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1),
      filter 0.4s ease-out,
      box-shadow 0.5s ease-out;
  }
}

.zen-modal-leave-active {
  transition:
    opacity 0.25s cubic-bezier(0.4, 0, 1, 1),
    backdrop-filter 0.3s ease-in;

  .zen-modal {
    transition:
      transform 0.25s cubic-bezier(0.4, 0, 1, 1),
      opacity 0.2s ease-in;
  }
}

.zen-modal-enter-from {
  opacity: 0;
  backdrop-filter: blur(0);

  .zen-modal {
    opacity: 0;
    transform: translateY(24px) scale(0.92);
    filter: blur(8px);
    box-shadow:
      0 0 0 1px oklch(0 0 0 / 0),
      0 0 0 oklch(0 0 0 / 0);
  }
}

.zen-modal-leave-to {
  opacity: 0;

  .zen-modal {
    opacity: 0;
    transform: translateY(-12px) scale(0.96);
  }
}

// Entrance glow effect for zen aesthetic
.zen-modal-enter-active .zen-modal {
  animation: zen-glow 0.6s ease-out forwards;
}

@keyframes zen-glow {
  0% {
    box-shadow:
      0 0 0 1px oklch(0 0 0 / 0.05),
      0 0 0 oklch(0 0 0 / 0),
      0 0 0 oklch(0 0 0 / 0);
  }
  40% {
    box-shadow:
      0 0 0 1px oklch(0 0 0 / 0.05),
      0 0 40px oklch(0.7 0.08 180 / 0.15),
      0 8px 32px oklch(0 0 0 / 0.15);
  }
  100% {
    box-shadow:
      0 0 0 1px oklch(0 0 0 / 0.05),
      0 8px 24px oklch(0 0 0 / 0.12),
      0 24px 48px oklch(0 0 0 / 0.08);
  }
}

[data-theme='dark'] .zen-modal-enter-active .zen-modal {
  animation: zen-glow-dark 0.6s ease-out forwards;
}

@keyframes zen-glow-dark {
  0% {
    box-shadow:
      0 0 0 1px oklch(1 0 0 / 0.05),
      0 0 0 oklch(0 0 0 / 0),
      0 0 0 oklch(0 0 0 / 0);
  }
  40% {
    box-shadow:
      0 0 0 1px oklch(1 0 0 / 0.08),
      0 0 50px oklch(0.6 0.1 180 / 0.2),
      0 8px 40px oklch(0 0 0 / 0.4);
  }
  100% {
    box-shadow:
      0 0 0 1px oklch(1 0 0 / 0.05),
      0 8px 24px oklch(0 0 0 / 0.3),
      0 24px 48px oklch(0 0 0 / 0.25);
  }
}

// Dark theme adjustments
[data-theme='dark'] {
  .zen-modal-overlay {
    background: oklch(0 0 0 / 0.65);
  }

  .zen-modal {
    box-shadow:
      0 0 0 1px oklch(1 0 0 / 0.05),
      0 8px 24px oklch(0 0 0 / 0.3),
      0 24px 48px oklch(0 0 0 / 0.25);
  }

  .zen-modal__actions {
    border-top-color: var(--gutenku-paper-border, oklch(0.3 0.01 60));
  }
}

// WCAG 2.2: Respect reduced motion preference
@media (prefers-reduced-motion: reduce) {
  .zen-modal-enter-active,
  .zen-modal-leave-active {
    transition: opacity 0.15s ease;

    .zen-modal {
      transition: opacity 0.15s ease;
      animation: none;
    }
  }

  .zen-modal-enter-from,
  .zen-modal-leave-to {
    .zen-modal {
      transform: none;
      filter: none;
    }
  }

  .zen-modal__close {
    transition: none;
  }

  @keyframes zen-glow {
    from, to {
      box-shadow:
        0 0 0 1px oklch(0 0 0 / 0.05),
        0 8px 24px oklch(0 0 0 / 0.12),
        0 24px 48px oklch(0 0 0 / 0.08);
    }
  }

  @keyframes zen-glow-dark {
    from, to {
      box-shadow:
        0 0 0 1px oklch(1 0 0 / 0.05),
        0 8px 24px oklch(0 0 0 / 0.3),
        0 24px 48px oklch(0 0 0 / 0.25);
    }
  }
}

// Mobile adjustments - bottom sheet with zen spring
@media (max-width: 600px) {
  .zen-modal-overlay {
    padding: 0;
    padding-top: 3rem;
    align-items: flex-end;
  }

  .zen-modal {
    max-height: calc(100vh - 3rem);
    max-height: calc(100dvh - 3rem);
    border-radius: var(--gutenku-radius-xl, 16px) var(--gutenku-radius-xl, 16px) 0 0;
    padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0));

    // Handle bar indicator
    &::before {
      content: '';
      position: absolute;
      top: 0.5rem;
      left: 50%;
      transform: translateX(-50%);
      width: 2.5rem;
      height: 0.25rem;
      background: var(--gutenku-zen-mist);
      border-radius: 2px;
      opacity: 0.6;
    }
  }

  .zen-modal-enter-active .zen-modal {
    transition:
      transform 0.45s cubic-bezier(0.32, 1.2, 0.5, 1),
      opacity 0.3s ease-out;
    animation: none;
  }

  .zen-modal-leave-active .zen-modal {
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 1, 1),
      opacity 0.2s ease-in;
  }

  .zen-modal-enter-from .zen-modal {
    transform: translateY(100%);
    filter: none;
  }

  .zen-modal-leave-to .zen-modal {
    transform: translateY(100%);
  }
}
</style>
