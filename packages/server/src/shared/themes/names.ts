import { AI_IMAGE_THEMES } from './ai-image';

// Themes drawn locally, without the image model: free and quick
export const STATIC_THEMES = [
  'catalogue',
  'greentea',
  'watermark',
  'exlibris',
  'frontispiece',
] as const;

export const IMAGE_THEMES: readonly string[] = [
  ...STATIC_THEMES,
  ...AI_IMAGE_THEMES,
];

export function isAIImageTheme(theme: string): boolean {
  return (AI_IMAGE_THEMES as readonly string[]).includes(theme);
}
