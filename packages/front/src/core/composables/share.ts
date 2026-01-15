import { computed, ref } from 'vue';
import type { HaikuValue } from '@gutenku/shared';
import { useClipboard } from './clipboard';

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

function base64ToFile(base64: string, filename: string): File {
  const byteString = atob(base64);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([arrayBuffer], { type: 'image/png' });

  return new File([blob], filename, { type: 'image/png' });
}

function canShareFiles(): boolean {
  if (typeof navigator === 'undefined' || !navigator.canShare) {
    return false;
  }
  const testFile = new File(['test'], 'test.png', { type: 'image/png' });

  return navigator.canShare({ files: [testFile] });
}

export function useShare() {
  const { copy, copied } = useClipboard();
  const shared = ref(false);

  const canNativeShare = computed(() => {
    if (typeof navigator === 'undefined') {
      return false;
    }
    return 'share' in navigator && typeof navigator.share === 'function';
  });

  async function share(haiku: HaikuValue): Promise<boolean> {
    const text = formatHaikuForShare(haiku);
    const title = haiku.title || 'Haiku';

    if (canNativeShare.value) {
      try {
        // Try to share image if available and supported
        if (haiku.image && canShareFiles()) {
          const bookTitle = haiku.book?.title || 'haiku';
          const chapterTitle = haiku.chapter?.title || '';
          const filename = `${bookTitle}_${chapterTitle}.png`.replaceAll(
            /\s+/g,
            '_',
          );
          const imageFile = base64ToFile(haiku.image, filename);

          await navigator.share({
            files: [imageFile],
            title,
            text,
          });
        }

        // Fall back to text-only share
        if (!haiku.image || !canShareFiles()) {
          await navigator.share({ text, title });
        }

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
