import { unlink } from 'node:fs/promises';
import { container } from 'tsyringe';
import type { HaikuValue } from '~/shared/types';
import type { DailyHaikuRecord } from '~/domain/repositories/IDailyHaikuRepository';
import {
  type ICanvasService,
  ICanvasServiceToken,
} from '~/domain/services/ICanvasService';
import {
  IMAGE_THEMES,
  STATIC_THEMES,
  isAIImageTheme,
} from '~/shared/themes/names';

/** Draws a haiku in a theme and returns the JPEG bytes. */
export type RenderDailyHaikuImage = (
  haiku: HaikuValue,
  theme: string,
  useImageAI: boolean,
) => Promise<Buffer>;

// Enough for a few weeks of days in a couple of themes; AI paintings are the
// expensive ones to lose
const IMAGE_CACHE_SIZE = 64;

export const defaultRenderDailyHaikuImage: RenderDailyHaikuImage = async (
  haiku,
  theme,
  useImageAI,
) => {
  const canvas = container.resolve<ICanvasService>(ICanvasServiceToken);
  // Same tick as create(): the shared service reads its theme before awaiting
  canvas.useTheme(theme);
  const imagePath = await canvas.create(haiku, useImageAI);

  try {
    return (await canvas.read(imagePath)).data;
  } finally {
    await unlink(imagePath).catch(() => {});
  }
};

/**
 * The theme a request asks for: a known name, or `random` (the default),
 * which picks among the drawn themes only — AI paintings must be named.
 * Null when the name is unknown.
 */
export function resolveImageTheme(
  requested: string | undefined,
): string | null {
  const theme = (requested ?? 'random').trim().toLowerCase();

  if (theme === 'random') {
    return STATIC_THEMES[Math.floor(Math.random() * STATIC_THEMES.length)];
  }

  return IMAGE_THEMES.includes(theme) ? theme : null;
}

function toHaikuValue(record: DailyHaikuRecord): HaikuValue {
  return {
    book: {
      reference: record.book.reference ?? '',
      title: record.book.title,
      author: record.book.author,
      emoticons: record.book.emoticons,
    },
    chapter: { title: record.chapter?.title, content: '' },
    verses: [...record.verses],
    rawVerses: [...(record.rawVerses ?? record.verses)],
    title: record.title,
    description: record.description,
    cacheUsed: true,
  };
}

/**
 * Renders a day in a theme, base64. A day and theme are drawn once: a repeat,
 * even one arriving while the first is still painting, gets the same image,
 * so an AI painting is paid for once. A re-published day changes the key.
 */
export function createDailyHaikuImageCache(render: RenderDailyHaikuImage) {
  const images = new Map<string, Promise<string>>();

  return (record: DailyHaikuRecord, theme: string): Promise<string> => {
    const key = `${record.date}|${new Date(record.publishedAt).getTime()}|${theme}`;
    const cached = images.get(key);

    if (cached) {
      return cached;
    }

    const image = render(toHaikuValue(record), theme, isAIImageTheme(theme))
      .then((data) => data.toString('base64'))
      .catch((err: unknown) => {
        images.delete(key);
        throw err;
      });

    images.set(key, image);

    if (images.size > IMAGE_CACHE_SIZE) {
      images.delete(images.keys().next().value as string);
    }

    return image;
  };
}

export { IMAGE_THEMES };
