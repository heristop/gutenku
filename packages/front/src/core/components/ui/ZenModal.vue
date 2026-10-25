<script lang="ts" setup>
import {
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  ref,
  nextTick,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { X } from '@/core/components/icons/ink';
import { useScrollLock } from '@/core/composables/scroll-lock';

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
  fullscreen?: boolean;
  /** CSS selector, inside the modal, for the element to focus on open */
  initialFocus?: string;
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
  fullscreen: false,
  initialFocus: undefined,
});

const emit = defineEmits<{
  close: [];
}>();

const modelValue = defineModel<boolean>({ default: false });
const { t } = useI18n();

const modalRef = ref<HTMLElement | null>(null);
const previousActiveElement = ref<HTMLElement | null>(null);

const titleId = computed(() =>
  props.title
    ? `zen-modal-${props.title.toLowerCase().replaceAll(/\s+/g, '-')}`
    : undefined,
);

const descriptionId = computed(() =>
  props.description
    ? `zen-modal-desc-${props.title?.toLowerCase().replaceAll(/\s+/g, '-') || 'modal'}`
    : undefined,
);

const maxWidthStyle = computed(() =>
  typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
);

const overlayClasses = computed(() => [
  'zen-modal-overlay',
  { 'zen-modal-overlay--fullscreen': props.fullscreen },
]);

const modalClasses = computed(() => [
  'zen-modal',
  'gutenku-paper',
  props.contentClass,
  `zen-modal--${props.variant}`,
  { 'zen-modal--with-divider': props.showDivider },
  { 'zen-modal--fullscreen': props.fullscreen },
]);

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// WCAG 2.2: Get all focusable elements within the modal
function getFocusableElements(): HTMLElement[] {
  if (!modalRef.value) {
    return [];
  }

  return [...modalRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
}

// Open on the thing the visitor came to do, not on the close button:
// an explicit target, then a form field, then the primary action, then
// the first control in the content.
function getInitialFocusTarget(): HTMLElement | null {
  const root = modalRef.value;

  if (!root) {
    return null;
  }

  const candidates = [
    props.initialFocus,
    '[data-autofocus]',
    '.zen-modal__content :is(input, select, textarea):not([disabled])',
    `.zen-modal__actions :is(${FOCUSABLE_SELECTOR})`,
    `.zen-modal__content :is(${FOCUSABLE_SELECTOR})`,
  ];

  for (const selector of candidates) {
    if (!selector) {
      continue;
    }

    const target = root.querySelector<HTMLElement>(selector);

    if (target) {
      return target;
    }
  }

  return null;
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

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (e.shiftKey) {
      // Shift + Tab: Move backwards
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }

      return;
    }

    // Tab: Move forwards
    if (document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }
}

function close(force = false) {
  if (force || !props.persistent) {
    emit('close');
    modelValue.value = false;
  }
}

function handleCloseButtonClick() {
  close(true);
}

function handleOverlayClick(e: MouseEvent) {
  // Only close if clicking directly on overlay, not modal content
  if (e.target === e.currentTarget && !props.persistent) {
    close();
  }
}

// WCAG 2.2: Scroll lock for mobile compatibility
const { lock: lockScroll, unlock: unlockScroll } = useScrollLock();

// Open/close side effects run once per state change, whether the modal was
// opened by a click, by code, or was already open when it mounted (a parent
// rendering it with v-model true never triggers the watcher).
let isActive = false;

async function activate(): Promise<void> {
  if (isActive) {
    return;
  }

  isActive = true;
  // Store the element that triggered the modal
  previousActiveElement.value = document.activeElement as HTMLElement;

  if (props.lockBodyScroll) {
    lockScroll();
  }

  // Escape is heard on the document, so it works wherever focus happens to be
  document.addEventListener('keydown', handleKeydown);

  // WCAG 2.2: Move focus into the modal
  await nextTick();

  if (!isActive) {
    return;
  }

  const target = getInitialFocusTarget() ?? getFocusableElements()[0];
  target?.focus();

  // Nothing focusable (or the target refused focus): hold focus on the dialog
  if (!modalRef.value?.contains(document.activeElement)) {
    modalRef.value?.focus();
  }
}

async function deactivate(): Promise<void> {
  if (!isActive) {
    return;
  }

  isActive = false;
  document.removeEventListener('keydown', handleKeydown);

  if (props.lockBodyScroll) {
    unlockScroll();
  }

  // WCAG 2.2: Return focus to triggering element
  await nextTick();
  const opener = previousActiveElement.value;
  previousActiveElement.value = null;

  if (opener && opener !== document.body && opener.isConnected) {
    opener.focus();
  }
}

watch(modelValue, (isOpen) => {
  if (isOpen) {
    activate();

    return;
  }

  deactivate();
});

onMounted(() => {
  if (modelValue.value) {
    activate();
  }
});

onBeforeUnmount(() => {
  if (isActive) {
    isActive = false;
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
        :class="overlayClasses"
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
            @click="handleCloseButtonClick"
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
// Ex Libris: a sheet laid over a dimmed page. Sumi scrim, no blur.
.zen-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--gk-scrim);
}

.zen-modal {
  position: relative;
  width: 100%;
  max-height: calc(100vh - 2rem);
  max-height: calc(100dvh - 2rem);
  padding: 1.5rem;
  overflow-y: auto;
  background: var(--gk-paper-raised);
  color: var(--gk-ink);
  border-radius: var(--gk-radius-paper);
  box-shadow: var(--gk-lift);

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 3px;
  }
}

// 44x44 close target
.zen-modal__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--gk-radius-control);
  color: var(--gk-ink-soft);
  cursor: pointer;
  transition:
    background-color var(--gk-dur-fast) var(--gk-ease-out),
    color var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-press) var(--gk-ease-out);

  @media (hover: hover) {
    &:hover {
      background: var(--gk-ink-faint);
      color: var(--gk-ink);
    }
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 2px;
  }
}

.zen-modal__header {
  margin-bottom: 1rem;
  padding-right: 2.5rem;
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
  border-top: var(--gk-rule);
}

.zen-modal--help {
  .zen-modal__content {
    font-size: 0.95rem;
  }
}

.zen-modal--stats {
  .zen-modal__content {
    font-variant-numeric: tabular-nums;
  }
}

.zen-modal--scroll {
  .zen-modal__content {
    max-height: 60vh;
    max-height: 60dvh;
    overflow-y: auto;
    padding-right: 0.5rem;
    scrollbar-width: thin;
    scrollbar-color: var(--gk-ink-faint) transparent;

    @media (max-width: 600px) {
      max-height: none;
      overflow-y: visible;
      padding-right: 0;
    }
  }
}

.zen-modal--with-divider {
  .zen-modal__header {
    padding-bottom: 1rem;
    border-bottom: var(--gk-rule);
  }
}

// Enter 240ms, leave 160ms, ease-out. Centred in the viewport, so it scales
// from its own centre with a 4px settle; no overshoot.
.zen-modal-enter-active {
  transition: opacity var(--gk-dur-base) var(--gk-ease-out);

  .zen-modal {
    transition:
      transform var(--gk-dur-base) var(--gk-ease-out),
      opacity var(--gk-dur-base) var(--gk-ease-out);
  }
}

.zen-modal-leave-active {
  transition: opacity var(--gk-dur-exit) var(--gk-ease-out);

  .zen-modal {
    transition:
      transform var(--gk-dur-exit) var(--gk-ease-out),
      opacity var(--gk-dur-exit) var(--gk-ease-out);
  }
}

.zen-modal-enter-from,
.zen-modal-leave-to {
  opacity: 0;

  .zen-modal {
    opacity: 0;
    transform: translateY(4px) scale(0.97);
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-modal-enter-active,
  .zen-modal-leave-active {
    transition: opacity 150ms ease;

    .zen-modal {
      transition: opacity 150ms ease;
    }
  }

  .zen-modal-enter-from,
  .zen-modal-leave-to {
    .zen-modal {
      transform: none;
    }
  }

  .zen-modal__close {
    transition: none;
  }
}

@media (forced-colors: active) {
  .zen-modal {
    border: 2px solid CanvasText;
  }
}

// Mobile: a sheet pulled up from the bottom edge
@media (max-width: 600px) {
  .zen-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .zen-modal {
    max-width: 100% !important;
    max-height: 100vh;
    max-height: 100dvh;
    border-radius: var(--gk-radius-paper) var(--gk-radius-paper) 0 0;
    border-top: var(--gk-rule);
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0));
  }

  .zen-modal-enter-active .zen-modal {
    transition:
      transform var(--gk-dur-base) var(--gk-ease-out),
      opacity var(--gk-dur-press) var(--gk-ease-out);
  }

  .zen-modal-enter-from .zen-modal,
  .zen-modal-leave-to .zen-modal {
    transform: translateY(100%);
  }
}

@media (max-width: 600px) and (prefers-reduced-motion: reduce) {
  .zen-modal-enter-from .zen-modal,
  .zen-modal-leave-to .zen-modal {
    transform: none;
  }
}

@media (max-width: 768px) {
  .zen-modal-overlay--fullscreen {
    padding: 0;
    align-items: flex-end;
  }

  .zen-modal--fullscreen {
    margin: 0;
    max-width: 100% !important;
    width: 100%;
    max-height: 100vh;
    max-height: 100dvh;
    border-radius: var(--gk-radius-paper) var(--gk-radius-paper) 0 0;
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0));
  }
}
</style>
