import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBotDetection } from '@/core/composables/bot-detection';

// Mock the botd module
vi.mock('@fingerprintjs/botd', () => ({
  load: vi.fn().mockResolvedValue({
    detect: vi.fn().mockReturnValue({ bot: false }),
  }),
}));

describe('useBotDetection', () => {
  let requestIdleCallbackSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock requestIdleCallback to run immediately
    requestIdleCallbackSpy = vi.fn((cb: IdleRequestCallback) => {
      cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline);
      return 1;
    });
    vi.stubGlobal('requestIdleCallback', requestIdleCallbackSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

    detectBot();

    // isLoading is set immediately before deferring
    expect(isLoading.value).toBeTruthy();

    // Wait for async detection to complete
    await vi.waitFor(() => {
      expect(isLoading.value).toBeFalsy();
    });
  });

  it('should detect non-bot correctly', async () => {
    const { isBot, detectBot } = useBotDetection();

    detectBot();

    await vi.waitFor(() => {
      expect(isBot.value).toBeFalsy();
    });
  });

  it('should detect bot correctly', async () => {
    const { load } = await import('@fingerprintjs/botd');
    (load as ReturnType<typeof vi.fn>).mockResolvedValue({
      detect: vi.fn().mockReturnValue({ bot: true }),
    });

    const { isBot, detectBot } = useBotDetection();

    detectBot();

    await vi.waitFor(() => {
      expect(isBot.value).toBeTruthy();
    });
  });

  it('should handle detection errors gracefully', async () => {
    const { load } = await import('@fingerprintjs/botd');
    (load as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Detection failed'),
    );

    const { isBot, isLoading, detectBot } = useBotDetection();

    detectBot();

    await vi.waitFor(() => {
      expect(isLoading.value).toBeFalsy();
    });

    expect(isBot.value).toBeFalsy();
  });

  it('should not run detection twice simultaneously', async () => {
    const { load } = await import('@fingerprintjs/botd');
    const detectMock = vi.fn().mockReturnValue({ bot: false });
    (load as ReturnType<typeof vi.fn>).mockResolvedValue({
      detect: detectMock,
    });

    const { detectBot } = useBotDetection();

    // Start two detections - second should be ignored due to isLoading guard
    detectBot();
    detectBot();

    await vi.waitFor(() => {
      expect(load).toHaveBeenCalledTimes(1);
    });
  });
});
