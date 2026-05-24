import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKeyboardShortcuts } from '@/features/haiku/composables/keyboard-shortcuts';
import { withSetup } from '../../../helpers/with-setup';

function dispatchKey(init: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { cancelable: true, ...init });
  globalThis.dispatchEvent(event);
  return event;
}

describe('useKeyboardShortcuts (dispatch behaviour)', () => {
  let handlers: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    handlers = {
      onGenerate: vi.fn(),
      onCopy: vi.fn(),
      onDownload: vi.fn(),
      onShare: vi.fn(),
      onPrevious: vi.fn(),
      onNext: vi.fn(),
      onHelp: vi.fn(),
      onEscape: vi.fn(),
    };
  });

  it('maps key codes to their handlers and prevents default (except Escape)', () => {
    const { unmount } = withSetup(() => useKeyboardShortcuts(handlers));

    const space = dispatchKey({ code: 'Space' });
    expect(handlers.onGenerate).toHaveBeenCalledOnce();
    expect(space.defaultPrevented).toBeTruthy();

    dispatchKey({ code: 'KeyC' });
    dispatchKey({ code: 'KeyD' });
    dispatchKey({ code: 'KeyS' });
    dispatchKey({ code: 'ArrowLeft' });
    dispatchKey({ code: 'ArrowRight' });
    expect(handlers.onCopy).toHaveBeenCalledOnce();
    expect(handlers.onDownload).toHaveBeenCalledOnce();
    expect(handlers.onShare).toHaveBeenCalledOnce();
    expect(handlers.onPrevious).toHaveBeenCalledOnce();
    expect(handlers.onNext).toHaveBeenCalledOnce();

    const escape = dispatchKey({ code: 'Escape' });
    expect(handlers.onEscape).toHaveBeenCalledOnce();
    expect(escape.defaultPrevented).toBeFalsy();

    unmount();
  });

  it('triggers help with "?" key and shift+slash', () => {
    const { unmount } = withSetup(() => useKeyboardShortcuts(handlers));

    dispatchKey({ key: '?' });
    expect(handlers.onHelp).toHaveBeenCalledOnce();

    dispatchKey({ key: 'Unidentified', shiftKey: true, code: 'Slash' });
    expect(handlers.onHelp).toHaveBeenCalledTimes(2);

    unmount();
  });

  it('ignores keys while typing in inputs', () => {
    const { unmount } = withSetup(() => useKeyboardShortcuts(handlers));

    const input = document.createElement('input');
    const event = new KeyboardEvent('keydown', { code: 'Space' });
    Object.defineProperty(event, 'target', { value: input });
    globalThis.dispatchEvent(event);

    expect(handlers.onGenerate).not.toHaveBeenCalled();
    unmount();
  });

  it('ignores keys when a modifier is held', () => {
    const { unmount } = withSetup(() => useKeyboardShortcuts(handlers));

    dispatchKey({ code: 'KeyC', metaKey: true });
    expect(handlers.onCopy).not.toHaveBeenCalled();
    unmount();
  });

  it('does nothing for unmapped keys', () => {
    const { unmount } = withSetup(() => useKeyboardShortcuts(handlers));

    dispatchKey({ code: 'KeyZ' });
    for (const handler of Object.values(handlers)) {
      expect(handler).not.toHaveBeenCalled();
    }
    unmount();
  });

  it('removes the listener on unmount', () => {
    const { unmount } = withSetup(() => useKeyboardShortcuts(handlers));
    unmount();

    dispatchKey({ code: 'Space' });
    expect(handlers.onGenerate).not.toHaveBeenCalled();
  });

  it('tolerates missing optional handlers', () => {
    const { unmount } = withSetup(() => useKeyboardShortcuts({}));
    expect(() => dispatchKey({ code: 'Space' })).not.toThrow();
    unmount();
  });
});
