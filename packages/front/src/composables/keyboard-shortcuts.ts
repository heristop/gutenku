import { onMounted, onUnmounted } from 'vue';

interface KeyboardShortcutsOptions {
  onGenerate?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onHelp?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  const handleKeydown = (event: KeyboardEvent) => {
    // Skip if user is typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    // Skip if modifier keys are pressed (allow browser shortcuts)
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        options.onGenerate?.();
        break;
      case 'KeyC':
        event.preventDefault();
        options.onCopy?.();
        break;
      case 'KeyD':
        event.preventDefault();
        options.onDownload?.();
        break;
      case 'KeyS':
        event.preventDefault();
        options.onShare?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        options.onPrevious?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        options.onNext?.();
        break;
    }

    if (event.key === '?' || (event.shiftKey && event.code === 'Slash')) {
      event.preventDefault();
      options.onHelp?.();
    }
  };

  onMounted(() => {
    globalThis.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    globalThis.removeEventListener('keydown', handleKeydown);
  });
}
