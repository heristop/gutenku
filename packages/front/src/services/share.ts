import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isNative } from '@/utils/capacitor';

export interface ShareData {
  title: string;
  text: string;
  url?: string;
  /** Native only: file URIs, such as one from cacheShareImage */
  files?: string[];
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
        files: data.files,
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
    await navigator.clipboard.writeText(
      data.url ? `${data.text}\n${data.url}` : data.text,
    );

    return true;
  }

  return false;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// The native share sheet takes files by path, so the image is written to
// the app's cache first; the OS clears it in its own time
export async function cacheShareImage(
  blob: Blob,
  filename: string,
): Promise<string> {
  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: await blobToBase64(blob),
    directory: Directory.Cache,
  });

  return uri;
}
