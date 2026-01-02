import { computed, type Ref, type ComputedRef } from 'vue';

export interface DigitDisplayOptions {
  padLength?: number;
  padChar?: string;
}

export function useDigitDisplay(
  value: Ref<number> | ComputedRef<number>,
  options: DigitDisplayOptions = {},
): ComputedRef<string[]> {
  const { padLength = 2, padChar = '0' } = options;

  return computed(() => [...String(value.value).padStart(padLength, padChar)]);
}

export function useTimeDigits(
  hours: Ref<number> | ComputedRef<number>,
  minutes: Ref<number> | ComputedRef<number>,
  seconds: Ref<number> | ComputedRef<number>,
) {
  return {
    hoursDigits: useDigitDisplay(hours),
    minutesDigits: useDigitDisplay(minutes),
    secondsDigits: useDigitDisplay(seconds),
  };
}
