import { describe, it, expect, vi, beforeEach } from 'vitest';

const shareData = {
  title: 'A Haiku',
  text: 'verse one\nverse two',
  url: 'https://gutenku.xyz/h/1',
};

describe('shareContent', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('uses native Capacitor Share when running natively and able to share', async () => {
    const share = vi.fn().mockResolvedValue();
    vi.doMock('@capacitor/share', () => ({
      Share: {
        canShare: vi.fn().mockResolvedValue({ value: true }),
        share,
      },
    }));
    vi.doMock('@/utils/capacitor', () => ({ isNative: true }));

    const { shareContent } = await import('@/services/share');
    const result = await shareContent(shareData);

    expect(result).toBeTruthy();
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url,
        dialogTitle: 'Share',
      }),
    );
  });

  it('falls through to Web Share API when native cannot share', async () => {
    vi.doMock('@capacitor/share', () => ({
      Share: {
        canShare: vi.fn().mockResolvedValue({ value: false }),
        share: vi.fn(),
      },
    }));
    vi.doMock('@/utils/capacitor', () => ({ isNative: true }));

    const webShare = vi.fn().mockResolvedValue();
    vi.stubGlobal('navigator', { share: webShare });

    const { shareContent } = await import('@/services/share');
    const result = await shareContent(shareData);

    expect(result).toBeTruthy();
    expect(webShare).toHaveBeenCalledWith({
      title: shareData.title,
      text: shareData.text,
      url: shareData.url,
    });
    vi.unstubAllGlobals();
  });

  it('uses the Web Share API on web platforms', async () => {
    vi.doMock('@capacitor/share', () => ({ Share: {} }));
    vi.doMock('@/utils/capacitor', () => ({ isNative: false }));

    const webShare = vi.fn().mockResolvedValue();
    vi.stubGlobal('navigator', { share: webShare });

    const { shareContent } = await import('@/services/share');
    const result = await shareContent(shareData);

    expect(result).toBeTruthy();
    expect(webShare).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });

  it('falls back to clipboard when no share API exists', async () => {
    vi.doMock('@capacitor/share', () => ({ Share: {} }));
    vi.doMock('@/utils/capacitor', () => ({ isNative: false }));

    const writeText = vi.fn().mockResolvedValue();
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const { shareContent } = await import('@/services/share');
    const result = await shareContent(shareData);

    expect(result).toBeTruthy();
    expect(writeText).toHaveBeenCalledWith(
      `${shareData.text}\n${shareData.url}`,
    );
    vi.unstubAllGlobals();
  });

  it('returns false when nothing can share', async () => {
    vi.doMock('@capacitor/share', () => ({ Share: {} }));
    vi.doMock('@/utils/capacitor', () => ({ isNative: false }));

    vi.stubGlobal('navigator', {});

    const { shareContent } = await import('@/services/share');
    const result = await shareContent(shareData);

    expect(result).toBeFalsy();
    vi.unstubAllGlobals();
  });
});
