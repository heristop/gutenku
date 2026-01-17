import { Share } from '@capacitor/share';
import { isNative } from '@/utils/capacitor';

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export async function shareContent(data: ShareData): Promise<boolean> {
  // Native share
  if (isNative) {
    const canShare = await Share.canShare();
    if (canShare.value) {
      await Share.share({
        title: data.title,
        text: data.text,
        url: data.url,
        dialogTitle: 'Share',
      });
      return true;
    }
  }

  // Web Share API fallback
  if (typeof navigator !== 'undefined' && navigator.share) {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
    });
    return true;
  }

  // Clipboard fallback
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(`${data.text}\n${data.url}`);
    return true;
  }

  return false;
}
