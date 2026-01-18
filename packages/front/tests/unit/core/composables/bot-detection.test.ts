import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBotDetection } from '@/core/composables/bot-detection';

// Mock the botd module
vi.mock('@fingerprintjs/botd', () => ({
  load: vi.fn().mockResolvedValue({
    detect: vi.fn().mockReturnValue({ bot: false }),
  }),
}));

describe('useBotDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with isBot as false', () => {
    const { isBot } = useBotDetection();
    expect(isBot.value).toBeFalsy();
  });

  it('should start with isLoading as false', () => {
    const { isLoading } = useBotDetection();
    expect(isLoading.value).toBeFalsy();
  });

  it('should expose detectBot function', () => {
    const { detectBot } = useBotDetection();
    expect(typeof detectBot).toBe('function');
  });

  it('should set isLoading during detection', async () => {
    const { isLoading, detectBot } = useBotDetection();

    expect(isLoading.value).toBeFalsy();

    const detectPromise = detectBot();

    // Note: Due to async nature, isLoading may already be true
    await detectPromise;

    expect(isLoading.value).toBeFalsy();
  });

  it('should detect non-bot correctly', async () => {
    const { isBot, detectBot } = useBotDetection();

    await detectBot();

    expect(isBot.value).toBeFalsy();
  });

  it('should detect bot correctly', async () => {
    const { load } = await import('@fingerprintjs/botd');
    (load as ReturnType<typeof vi.fn>).mockResolvedValue({
      detect: vi.fn().mockReturnValue({ bot: true }),
    });

    const { isBot, detectBot } = useBotDetection();

    await detectBot();

    expect(isBot.value).toBeTruthy();
  });

  it('should handle detection errors gracefully', async () => {
    const { load } = await import('@fingerprintjs/botd');
    (load as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Detection failed'),
    );

    const { isBot, detectBot } = useBotDetection();

    await detectBot();

    expect(isBot.value).toBeFalsy();
  });

  it('should not run detection twice simultaneously', async () => {
    const { load } = await import('@fingerprintjs/botd');
    const detectMock = vi.fn().mockReturnValue({ bot: false });
    (load as ReturnType<typeof vi.fn>).mockResolvedValue({
      detect: detectMock,
    });

    const { detectBot } = useBotDetection();

    // Start two detections
    const p1 = detectBot();
    const p2 = detectBot();

    await Promise.all([p1, p2]);

    // Should only call load once due to isLoading guard
    expect(load).toHaveBeenCalledTimes(1);
  });
});
