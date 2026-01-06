import OpenAI from 'openai';
import Canvas from 'canvas';
import type { HaikuValue } from '~/shared/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  drawImageCover,
} from '~/shared/constants/canvas';

export default {
  async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
    const verses = haiku.verses;
    Canvas.registerFont('./src/shared/assets/fonts/ZenKurenaido-Regular.ttf', {
      family: 'ZenKurenaido',
    });

    const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#f4efe4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const backgroundImageData = await generateBookZenBackground(haiku);
    if (backgroundImageData) {
      const background = await Canvas.loadImage(backgroundImageData);
      ctx.globalAlpha = 0.85;
      drawImageCover(ctx, background, canvas.width, canvas.height);
    }

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#f4efe4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 128px ZenKurenaido';
    ctx.globalAlpha = 1;

    const x = 200;
    let y = canvas.height / 4;

    verses.map((verse) => {
      ctx.strokeStyle = 'rgba(244, 239, 228, 0.9)';
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.strokeText(verse, x, y);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText(verse, x, y);
      y += 420;
    });

    ctx.font = 'bold 123px ZenKurenaido';
    ctx.strokeStyle = 'rgba(244, 239, 228, 0.85)';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.strokeText('- GutenKu', canvas.width - 780, canvas.height - 240);
    ctx.fillStyle = '#5c4033';
    ctx.fillText('- GutenKu', canvas.width - 780, canvas.height - 240);

    return canvas;
  },
};

async function generateBookZenBackground(
  haiku: HaikuValue,
): Promise<Buffer | null> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `THE HAIKU IS YOUR PRIMARY INSPIRATION. Study these verses deeply and evoke their meaning through books and Zen stillness:

"${haiku.verses[0]}"
"${haiku.verses[1]}"
"${haiku.verses[2]}"

CRITICAL: Create a scene where BOOKS become the vessel for the haiku's imagery. If the haiku speaks of nature, show books surrounded by that nature. If it captures solitude, depict a single book in quiet contemplation. If it mentions seasons, let the books be touched by that season.

Interpret the haiku's:
- Core imagery translated into a literary setting
- Emotional atmosphere (contemplation, wisdom, discovery, serenity)
- Connection between written word and the natural world
- Sense of timeless knowledge and Zen simplicity

Visual elements: Ancient leather-bound books, scrolls, open manuscripts, calligraphy brushes, ink stones, reading stones, bookmark ribbons, candlelight, scattered pages, pressed flowers between pages, magnifying glass.

Setting: Could be a zen study, moonlit library corner, books under cherry blossoms, reading nook by a window, stack of books on tatami, garden pavilion with scrolls.

Palette: Warm sepia, aged cream, leather browns, ink blacks, soft gold accents, muted greens from nature elements.

Mood: Scholarly serenity, the peace of reading, wisdom accumulated through ages, quiet contemplation.

CRITICAL: Absolutely NO text, letters, characters, kanji, hiragana, katakana, or any written symbols in the image. Pure visual art only.`;

    const response = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5',
      n: 1,
      output_format: 'png',
      prompt: prompt,
      quality: (process.env.OPENAI_IMAGE_QUALITY || 'high') as
        | 'high'
        | 'low'
        | 'medium'
        | 'auto',
      size: '1024x1536',
      user: 'gutenku-bookzen-theme',
    });

    const imageBase64 = response.data[0].b64_json;

    if (!imageBase64) {
      console.error('No image data returned from OpenAI GPT-Image API');
      return null;
    }

    return Buffer.from(imageBase64, 'base64');
  } catch (error) {
    console.error('OpenAI image generation failed for bookzen theme:', error);
    return null;
  }
}
