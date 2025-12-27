import { onMounted, onUnmounted } from 'vue';

interface KeyboardShortcutsOptions {
  onGenerate?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
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
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
}
