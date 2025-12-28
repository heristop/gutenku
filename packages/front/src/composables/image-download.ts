import { ref } from 'vue';

export interface DownloadOptions {
  filename?: string;
  extension?: string;
  delayMs?: number;
}

export function useImageDownload(defaultDelayMs = 1000) {
  const inProgress = ref(false);

  const sanitizeFilename = (name: string): string => {
    return name.toLowerCase().replaceAll(/[ ;.,]/g, '_');
  };

  const download = async (
    dataUrl: string,
    options: DownloadOptions = {},
  ): Promise<boolean> => {
    const {
      filename = 'image',
      extension = '',
      delayMs = defaultDelayMs,
    } = options;

    inProgress.value = true;

    try {
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = sanitizeFilename(filename) + extension;
      downloadLink.target = '_blank';
      downloadLink.click();

      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });
      inProgress.value = false;
      return true;
    } catch {
      inProgress.value = false;
      return false;
    }
  };

  return {
    inProgress,
    download,
    sanitizeFilename,
  };
}
