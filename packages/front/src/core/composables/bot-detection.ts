import { ref } from 'vue';

export function useBotDetection() {
  const isBot = ref(false);
  const isLoading = ref(false);

  const runDetection = async () => {
    try {
      const { load } = await import('@fingerprintjs/botd');
      const botd = await load();
      const result = botd.detect();
      isBot.value = result.bot === true;
    } catch {
      isBot.value = false;
    } finally {
      isLoading.value = false;
    }
  };

  const detectBot = () => {
    if (isLoading.value) {
      return;
    }

    isLoading.value = true;

    // Defer bot detection to run after page is interactive
    // This prevents blocking the main thread during initial render
    if ('requestIdleCallback' in globalThis) {
      requestIdleCallback(
        () => {
          runDetection();
        },
        { timeout: 5000 },
      );
    } else {
      // Fallback for browsers without requestIdleCallback (Safari)
      setTimeout(() => {
        runDetection();
      }, 2000);
    }
  };

  return { isBot, isLoading, detectBot };
}
