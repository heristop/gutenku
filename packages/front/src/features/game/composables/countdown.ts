import { ref, onUnmounted, computed } from 'vue';

interface CountdownOptions {
  targetTime?: string;
  getTargetTime?: () => string | undefined;
  onComplete?: () => void;
}

function getTimeUntilMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.max(0, tomorrow.getTime() - now.getTime());
}

function getTimeUntilTarget(targetTime: string): number {
  return Math.max(0, new Date(targetTime).getTime() - Date.now());
}

export function useCountdown(options: CountdownOptions = {}) {
  const getRemaining = () => {
    const targetTime = options.getTargetTime?.() ?? options.targetTime;
    return targetTime ? getTimeUntilTarget(targetTime) : getTimeUntilMidnight();
  };

  const timeRemaining = ref(getRemaining());
  const isComplete = ref(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function formatTime(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

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
    timeRemaining.value = getRemaining();
    isComplete.value = false;

    intervalId = setInterval(() => {
      const remaining = getRemaining();
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
