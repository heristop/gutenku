import { useClipboard as useVueUseClipboard } from '@vueuse/core';

export function useClipboard(resetDelayMs = 2000) {
  const { copy: vueUseCopy, copied } = useVueUseClipboard({
    copiedDuring: resetDelayMs,
  });

  const copy = async (text: string): Promise<boolean> => {
    try {
      await vueUseCopy(text);

      return true;
    } catch {
      return false;
    }
  };

  return { copy, copied };
}
