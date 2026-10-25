import OpenAI from 'openai';
import type Canvas from 'canvas';
import {
  currentOpenAIKey,
  reportOpenAIFailure,
} from '~/infrastructure/external/openai-scope';

// gpt-image-2.5-sunburst is the base model; gpt-image-2.5-flare is the
// smaller, faster one. Either can be set through OPENAI_IMAGE_MODEL.
export const DEFAULT_IMAGE_MODEL = 'gpt-image-2.5-sunburst';
export const DEFAULT_IMAGE_QUALITY = 'high';

// Themes whose background is painted by the image model
export const AI_IMAGE_THEMES = [
  'nihonga',
  'sumie',
  'ukiyoe',
  'zengarden',
  'wabisabi',
  'bookzen',
] as const;

// Rough drafts the model sends while it paints, before the final image
const PARTIAL_IMAGES = 2;

type ImageQuality = 'low' | 'medium' | 'high' | 'xhigh' | 'max' | 'auto';

export type PartialImageHandler = (image: Buffer) => void | Promise<void>;

type ImageParams = Parameters<OpenAI['images']['generate']>[0];

// Hands each draft over as it arrives; resolves with the finished image
async function streamImage(
  openai: OpenAI,
  params: ImageParams,
  theme: string,
  onPartial: PartialImageHandler,
): Promise<string | undefined> {
  const stream = await openai.images.generate({
    ...params,
    stream: true,
    partial_images: PARTIAL_IMAGES,
  });
  let finished: string | undefined;

  for await (const event of stream) {
    if (event.type === 'image_generation.completed') {
      finished = event.b64_json;
      continue;
    }

    // A draft is only a preview: losing one must not lose the image
    await Promise.resolve(
      onPartial(Buffer.from(event.b64_json, 'base64')),
    ).catch((error: unknown) => {
      console.error(`Partial image preview failed for ${theme}:`, error);
    });
  }

  return finished;
}

// Portrait background behind a theme's haiku card. With onPartial, the
// image is streamed and each draft is handed over as it arrives.
export async function generateThemeBackground(
  theme: string,
  prompt: string,
  onPartial?: PartialImageHandler,
): Promise<Buffer | null> {
  try {
    const openai = new OpenAI({
      apiKey: currentOpenAIKey(),
    });

    const params = {
      model: process.env.OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
      n: 1,
      output_format: 'png' as const,
      prompt,
      quality: (process.env.OPENAI_IMAGE_QUALITY ||
        DEFAULT_IMAGE_QUALITY) as ImageQuality,
      size: '1024x1536',
      safety_identifier: `gutenku-${theme}-theme`,
    };

    const imageBase64 = onPartial
      ? await streamImage(openai, params, theme, onPartial)
      : (await openai.images.generate(params)).data?.[0]?.b64_json;

    if (!imageBase64) {
      console.error('No image data returned from OpenAI GPT-Image API');

      return null;
    }

    return Buffer.from(imageBase64, 'base64');
  } catch (error) {
    // Only the kind of failure: OpenAI's message can quote part of the key
    const failure = reportOpenAIFailure(error);
    const { status } = (error ?? {}) as { status?: number };

    console.error(
      `OpenAI image generation failed for ${theme} theme: ${failure}`,
      status ?? '',
    );

    return null;
  }
}

export interface ThemeCreateOptions {
  // Receives the card drawn over each draft background while it streams
  onPreview?: (canvas: Canvas.Canvas) => void | Promise<void>;
}
