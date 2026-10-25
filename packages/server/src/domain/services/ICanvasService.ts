import type { HaikuValue } from '~/shared/types';

// Receives a small JPEG (base64) of the card while its AI background is
// still being painted
export type ImagePreviewHandler = (jpegBase64: string) => void;

export interface ICanvasService {
  useTheme(theme: string): void;
  create(
    haiku: HaikuValue,
    useImageAI?: boolean,
    onPreview?: ImagePreviewHandler,
  ): Promise<string>;
  read(imagePath: string): Promise<{ data: Buffer; contentType: string }>;
}

export const ICanvasServiceToken = 'ICanvasService';
