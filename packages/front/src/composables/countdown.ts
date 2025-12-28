import { ref, onUnmounted, computed } from 'vue';

export function useCountdown() {
  const timeRemaining = ref(getTimeUntilMidnight());
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function getTimeUntilMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  }

  function formatTime(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function start() {
    if (intervalId) {
      return;
    }
    intervalId = setInterval(() => {
      timeRemaining.value = getTimeUntilMidnight();
    }, 1000);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  onUnmounted(() => {
    stop();
  });

  const formattedTime = computed(() => formatTime(timeRemaining.value));

  return {
    timeRemaining,
    formattedTime,
    start,
    stop,
  };
}
