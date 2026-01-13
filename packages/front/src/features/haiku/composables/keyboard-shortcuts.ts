import { onMounted, onUnmounted } from 'vue';

interface KeyboardShortcutsOptions {
  onGenerate?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onHelp?: () => void;
  onEscape?: () => void;
}

type ShortcutHandler = keyof Omit<KeyboardShortcutsOptions, 'onHelp'>;

const KEYBOARD_SHORTCUTS: Record<string, ShortcutHandler> = {
  Space: 'onGenerate',
  KeyC: 'onCopy',
  KeyD: 'onDownload',
  KeyS: 'onShare',
  ArrowLeft: 'onPrevious',
  ArrowRight: 'onNext',
  Escape: 'onEscape',
};

const TYPING_ELEMENTS = ['INPUT', 'TEXTAREA'];

function shouldIgnoreKeydown(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  const isTyping =
    TYPING_ELEMENTS.includes(target.tagName) || target.isContentEditable;
  const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
  return isTyping || hasModifier;
}

function isHelpKey(event: KeyboardEvent): boolean {
  return event.key === '?' || (event.shiftKey && event.code === 'Slash');
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  const handleKeydown = (event: KeyboardEvent) => {
    if (shouldIgnoreKeydown(event)) {
      return;
    }

    const handler = KEYBOARD_SHORTCUTS[event.code];

    if (handler) {
      if (event.code !== 'Escape') {event.preventDefault();}
      options[handler]?.();
      return;
    }

    if (isHelpKey(event)) {
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
