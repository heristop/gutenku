import { ref } from 'vue';

export function useBotDetection() {
  const isBot = ref(false);
  const isLoading = ref(false);

  const detectBot = async () => {
    if (isLoading.value) {return;}

    isLoading.value = true;
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

  return { isBot, isLoading, detectBot };
}
