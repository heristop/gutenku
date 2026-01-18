import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @vueuse/core
const mockCopy = vi.fn();
const mockCopied = { value: false };

vi.mock('@vueuse/core', () => ({
  useClipboard: vi.fn(() => ({
    copy: mockCopy,
    copied: mockCopied,
  })),
}));

describe('useClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCopy.mockReset();
    mockCopy.mockResolvedValue(undefined);
    mockCopied.value = false;
  });

  it('should expose copy and copied', async () => {
    const { useClipboard } = await import('@/core/composables/clipboard');
    const { copy, copied } = useClipboard();

    expect(typeof copy).toBe('function');
    expect(copied).toBeDefined();
  });

  it('should return true on successful copy', async () => {
    mockCopy.mockResolvedValue(undefined);

    const { useClipboard } = await import('@/core/composables/clipboard');
    const { copy } = useClipboard();
    const result = await copy('test text');

    expect(result).toBe(true);
    expect(mockCopy).toHaveBeenCalledWith('test text');
  });

  it('should return false on failed copy', async () => {
    mockCopy.mockRejectedValue(new Error('Copy failed'));

    const { useClipboard } = await import('@/core/composables/clipboard');
    const { copy } = useClipboard();
    const result = await copy('test text');

    expect(result).toBe(false);
  });

  it('should use custom reset delay', async () => {
    const { useClipboard: mockVueUseClipboard } = await import('@vueuse/core');

    const { useClipboard } = await import('@/core/composables/clipboard');
    useClipboard(5000);

    expect(mockVueUseClipboard).toHaveBeenCalledWith({
      copiedDuring: 5000,
    });
  });

  it('should use default reset delay of 2000ms', async () => {
    const { useClipboard: mockVueUseClipboard } = await import('@vueuse/core');

    const { useClipboard } = await import('@/core/composables/clipboard');
    useClipboard();

    expect(mockVueUseClipboard).toHaveBeenCalledWith({
      copiedDuring: 2000,
    });
  });
});
