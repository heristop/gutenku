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
    Canvas.registerFont('./src/shared/assets/fonts/IndieFlower-Regular.ttf', {
      family: 'IndieFlower',
    });

    const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const backgroundImageData = await generateNihongaBackground(haiku);
    if (backgroundImageData) {
      const background = await Canvas.loadImage(backgroundImageData);
      ctx.globalAlpha = 0.7;
      drawImageCover(ctx, background, canvas.width, canvas.height);
    }

    ctx.globalAlpha = 0.65;
    ctx.fillStyle = '#DFEEEA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 115px IndieFlower';
    ctx.globalAlpha = 1;

    const x = 250;
    let y = canvas.height / 4;
    verses.map((verse) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.strokeText(verse, x, y);
      ctx.fillStyle = '#1d4a4f';
      ctx.fillText(verse, x, y);
      y += 420;
    });

    ctx.font = 'bold 110px IndieFlower';
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.strokeText('- GutenKu', canvas.width - 780, canvas.height - 240);
    ctx.fillStyle = '#2F5D62';
    ctx.fillText('- GutenKu', canvas.width - 780, canvas.height - 240);

    return canvas;
  },
};

async function generateNihongaBackground(
  haiku: HaikuValue,
): Promise<Buffer | null> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `THE HAIKU IS YOUR PRIMARY INSPIRATION. Study these verses deeply and translate their imagery into visual art:

"${haiku.verses[0]}"
"${haiku.verses[1]}"
"${haiku.verses[2]}"

CRITICAL: Every visual element must directly emerge from words, images, and emotions in these three lines. If the haiku mentions moonlight, show moonlight. If it speaks of falling leaves, depict falling leaves. If it evokes loneliness, capture that solitude visually.

Interpret the haiku's:
- Concrete imagery (objects, nature, seasons mentioned)
- Emotional atmosphere (joy, melancholy, wonder, peace)
- Hidden symbolism and deeper meaning
- Seasonal references (kigo) if present

Art style: Traditional nihonga (Japanese painting) with mineral pigments on silk. Soft, harmonious colors. Peaceful minimalist composition. But the CONTENT must come entirely from the haiku verses above.

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
      user: 'gutenku-nihonga-theme',
    });

    const imageBase64 = response.data[0].b64_json;

    if (!imageBase64) {
      console.error('No image data returned from OpenAI GPT-Image API');

      return null;
    }

    return Buffer.from(imageBase64, 'base64');
  } catch (error) {
    console.error('OpenAI image generation failed for nihonga theme:', error);

    return null;
  }
}
