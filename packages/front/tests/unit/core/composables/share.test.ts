import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useShare } from '@/core/composables/share';
import type { HaikuValue } from '@gutenku/shared';

// Mock clipboard composable
vi.mock('@/core/composables/clipboard', () => ({
  useClipboard: vi.fn(() => ({
    copy: vi.fn().mockResolvedValue(true),
    copied: { value: false },
  })),
}));

describe('useShare', () => {
  const mockHaiku: HaikuValue = {
    verses: ['First line here', 'Second line is longer', 'Third line end'],
    title: 'Test Haiku',
    book: {
      title: 'Test Book',
      author: 'Test Author',
      id: '1',
    },
    chapter: {
      title: 'Chapter 1',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should expose share function', () => {
    const { share } = useShare();
    expect(typeof share).toBe('function');
  });

  it('should expose shared ref', () => {
    const { shared } = useShare();
    expect(shared.value).toBe(false);
  });

  it('should expose copied ref', () => {
    const { copied } = useShare();
    expect(copied).toBeDefined();
  });

  it('should expose canNativeShare computed', () => {
    const { canNativeShare } = useShare();
    expect(typeof canNativeShare.value).toBe('boolean');
  });

  it('should format haiku correctly for sharing', () => {
    const { formatHaikuForShare } = useShare();

    const formatted = formatHaikuForShare(mockHaiku);

    expect(formatted).toContain('First line here');
    expect(formatted).toContain('Second line is longer');
    expect(formatted).toContain('Third line end');
    expect(formatted).toContain('"Test Haiku"');
    expect(formatted).toContain('from "Test Book" by Test Author');
    expect(formatted).toContain('Generated with gutenku.xyz');
  });

  it('should handle haiku without title', () => {
    const { formatHaikuForShare } = useShare();
    const haikuNoTitle = { ...mockHaiku, title: undefined };

    const formatted = formatHaikuForShare(haikuNoTitle);

    expect(formatted).not.toContain('"Test Haiku"');
    expect(formatted).toContain('First line here');
  });

  it('should handle haiku without book info', () => {
    const { formatHaikuForShare } = useShare();
    const haikuNoBook = { ...mockHaiku, book: undefined };

    const formatted = formatHaikuForShare(haikuNoBook);

    expect(formatted).not.toContain('from "Test Book"');
    expect(formatted).toContain('First line here');
  });

  it('should use clipboard when native share is not available', async () => {
    // navigator.share is mocked but canShare returns false by default
    const originalShare = navigator.share;
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });

    const { share } = useShare();
    const result = await share(mockHaiku);

    expect(result).toBe(true);

    Object.defineProperty(navigator, 'share', {
      value: originalShare,
      configurable: true,
    });
  });

  it('should return true on successful share', async () => {
    const { share } = useShare();
    const result = await share(mockHaiku);

    expect(result).toBe(true);
  });

  it('should handle empty verses', () => {
    const { formatHaikuForShare } = useShare();
    const haikuNoVerses = { ...mockHaiku, verses: [] };

    const formatted = formatHaikuForShare(haikuNoVerses);

    expect(formatted).toContain('"Test Haiku"');
    expect(formatted).toContain('Generated with gutenku.xyz');
  });
});
