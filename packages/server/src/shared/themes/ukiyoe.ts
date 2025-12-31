import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const OpenAI = require('openai').default;
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
    Canvas.registerFont('./src/shared/assets/fonts/Yomogi-Regular.ttf', {
      family: 'Yomogi',
    });

    const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    const backgroundImageData = await generateUkiyoeBackground(haiku);
    const background = await Canvas.loadImage(backgroundImageData);

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff8e7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.9;
    drawImageCover(ctx, background, canvas.width, canvas.height);

    // Strong overlay to soften background for text readability
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#fff8e7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 135px Yomogi';
    ctx.globalAlpha = 1;

    const x = 180;
    let y = canvas.height / 4;

    verses.map((verse) => {
      // Very dark text on light overlay
      ctx.fillStyle = '#0a0a14';
      ctx.fillText(verse, x, y);
      y += 480;
    });

    // Signature
    ctx.font = 'bold 125px Yomogi';
    ctx.fillStyle = '#4a1525';
    ctx.fillText('- GutenKu', canvas.width - 620, canvas.height - 280);

    return canvas;
  },
};

async function generateUkiyoeBackground(haiku: HaikuValue): Promise<Buffer> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `THE HAIKU IS YOUR PRIMARY INSPIRATION. Study these verses deeply and translate their world into a woodblock print:

"${haiku.verses[0]}"
"${haiku.verses[1]}"
"${haiku.verses[2]}"

CRITICAL: The scene you create must be a DIRECT visualization of these three lines. Every element in the print should trace back to words or imagery in the haiku. If the haiku mentions waves, show waves. If it speaks of a journey, depict that path. If it captures cherry blossoms, fill the scene with them.

Interpret the haiku's:
- Specific scene or setting described
- Natural elements mentioned (water, mountains, flowers, sky)
- Human elements if present (travelers, fishermen, lovers)
- Time of day, season, weather conditions implied

Art style: Traditional Edo period ukiyo-e woodblock print. Bold black outlines, flat color planes. Rich colors: indigo blue, vermillion red, gold ochre, forest green. But the SCENE must come entirely from the haiku verses above.

Composition: Layered perspective typical of Japanese prints. Flowing lines with artistic stylization.

CRITICAL: Absolutely NO text, letters, characters, kanji, hiragana, katakana, or any written symbols in the image. Pure visual art only.`;

  const response = await openai.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5',
    n: 1,
    output_format: 'png',
    prompt: prompt,
    quality: process.env.OPENAI_IMAGE_QUALITY || 'high',
    size: '1024x1024',
    user: 'gutenku-ukiyoe-theme',
  });

  const imageBase64 = response.data[0].b64_json;

  if (!imageBase64) {
    throw new Error('No image data returned from GPT-Image API');
  }

  return Buffer.from(imageBase64, 'base64');
}
