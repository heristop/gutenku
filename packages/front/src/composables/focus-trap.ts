import { type Ref, onMounted, onUnmounted, nextTick } from 'vue';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface FocusTrapOptions {
  /** Restore focus to previously focused element on deactivate */
  restoreFocus?: boolean;
  /** Focus first element when activated */
  autoFocus?: boolean;
}

export function useFocusTrap(
  containerRef: Ref<HTMLElement | null>,
  options: FocusTrapOptions = {},
) {
  const { restoreFocus = true, autoFocus = true } = options;

  let previousActiveElement: HTMLElement | null = null;
  let isActive = false;

  function getFocusableElements(): HTMLElement[] {
    if (!containerRef.value) {
      return [];
    }
    return [
      ...containerRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ].filter((el) => el.offsetParent !== null);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isActive || event.key !== 'Tab') {
      return;
    }

    const focusable = getFocusableElements();
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable.at(-1)!;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function activate() {
    if (isActive) {
      return;
    }

    previousActiveElement = document.activeElement as HTMLElement;
    isActive = true;

    if (autoFocus) {
      nextTick(() => {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          containerRef.value?.focus();
        }
      });
    }
  }

  function deactivate() {
    if (!isActive) {
      return;
    }

    isActive = false;

    if (restoreFocus && previousActiveElement) {
      nextTick(() => {
        previousActiveElement?.focus();
        previousActiveElement = null;
      });
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
    deactivate();
  });

  return {
    activate,
    deactivate,
    getFocusableElements,
  };
}
