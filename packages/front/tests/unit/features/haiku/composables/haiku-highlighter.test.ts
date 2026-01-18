import { describe, it, expect, vi, beforeEach } from 'vitest';

// Read the actual composable to understand its interface
describe('useHaikuHighlighter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be importable', async () => {
    const module =
      await import('@/features/haiku/composables/haiku-highlighter');
    expect(module).toBeDefined();
  });
});
