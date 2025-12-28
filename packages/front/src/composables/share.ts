import { computed, ref } from 'vue';
import type { HaikuValue } from '@gutenku/shared';
import { useClipboard } from './clipboard';

export function useShare() {
  const { copy, copied } = useClipboard();
  const shared = ref(false);

  const canNativeShare = computed(() => {
    if (typeof navigator === 'undefined') {
      return false;
    }
    return 'share' in navigator && typeof navigator.share === 'function';
  });

  function formatHaikuForShare(haiku: HaikuValue): string {
    const lines: string[] = [];

    if (haiku.verses?.length) {
      lines.push(...haiku.verses);
      lines.push('');
    }

    if (haiku.title) {
      lines.push(`"${haiku.title}"`);
    }

    if (haiku.book?.title && haiku.book?.author) {
      lines.push(`from "${haiku.book.title}" by ${haiku.book.author}`);
    }

    lines.push('');
    lines.push('Generated with gutenku.xyz');

    return lines.join('\n');
  }

  async function share(haiku: HaikuValue): Promise<boolean> {
    const text = formatHaikuForShare(haiku);
    const title = haiku.title || 'Haiku';

    if (canNativeShare.value) {
      try {
        await navigator.share({ text, title });
        shared.value = true;
        setTimeout(() => {
          shared.value = false;
        }, 2000);
        return true;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return false;
        }
        await copy(text);
        return true;
      }
    }

    await copy(text);
    shared.value = copied.value;
    return true;
  }

  return {
    share,
    shared,
    copied,
    canNativeShare,
    formatHaikuForShare,
  };
}
