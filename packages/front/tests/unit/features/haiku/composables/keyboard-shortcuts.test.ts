import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be importable', async () => {
    const module = await import(
      '@/features/haiku/composables/keyboard-shortcuts'
    );
    expect(module.useKeyboardShortcuts).toBeDefined();
  });

  it('should accept handlers object', async () => {
    const { useKeyboardShortcuts } = await import(
      '@/features/haiku/composables/keyboard-shortcuts'
    );

    const handlers = {
      generate: vi.fn(),
      toggleDrawer: vi.fn(),
    };

    expect(() => useKeyboardShortcuts(handlers)).not.toThrow();
  });
});
