import { ref, onUnmounted, computed } from 'vue';

interface CountdownOptions {
  onComplete?: () => void;
}

export function useCountdown(options: CountdownOptions = {}) {
  const timeRemaining = ref(getTimeUntilMidnight());
  const isComplete = ref(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function getTimeUntilMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return Math.max(0, tomorrow.getTime() - now.getTime());
  }

  function formatTime(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Individual time units for animated display
  const hours = computed(() =>
    Math.floor(timeRemaining.value / (1000 * 60 * 60)),
  );
  const minutes = computed(() =>
    Math.floor((timeRemaining.value % (1000 * 60 * 60)) / (1000 * 60)),
  );
  const seconds = computed(() =>
    Math.floor((timeRemaining.value % (1000 * 60)) / 1000),
  );

  function start() {
    if (intervalId) {
      return;
    }
    // Update immediately on start
    timeRemaining.value = getTimeUntilMidnight();
    isComplete.value = false;

    intervalId = setInterval(() => {
      const remaining = getTimeUntilMidnight();
      timeRemaining.value = remaining;

      if (remaining <= 0 && !isComplete.value) {
        isComplete.value = true;
        stop();
        options.onComplete?.();
      }
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
    hours,
    minutes,
    seconds,
    isComplete,
    start,
    stop,
  };
}
