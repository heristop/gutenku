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
    Canvas.registerFont(
      './src/shared/assets/fonts/NanumBrushScript-Regular.ttf',
      { family: 'NanumBrushScript' },
    );

    const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    const backgroundImageData = await generateSumieBackground(haiku);
    const background = await Canvas.loadImage(backgroundImageData);

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.85;
    drawImageCover(ctx, background, canvas.width, canvas.height);

    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 165px NanumBrushScript';
    ctx.globalAlpha = 1;

    const x = 180;
    let y = canvas.height / 4;
    verses.map((verse) => {
      ctx.strokeStyle = 'rgba(245, 245, 220, 0.9)';
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.strokeText(verse, x, y);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillText(verse, x, y);
      y += 480;
    });

    ctx.font = 'bold 145px NanumBrushScript';
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(245, 245, 220, 0.85)';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.strokeText('- GutenKu', canvas.width - 700, canvas.height - 280);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('- GutenKu', canvas.width - 700, canvas.height - 280);

    return canvas;
  },
};

async function generateSumieBackground(haiku: HaikuValue): Promise<Buffer> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `THE HAIKU IS YOUR PRIMARY INSPIRATION. Study these verses deeply and translate their essence into ink:

"${haiku.verses[0]}"
"${haiku.verses[1]}"
"${haiku.verses[2]}"

CRITICAL: The subject of your ink painting must come DIRECTLY from these three lines. Paint what the haiku describes. If it mentions a bird, paint that bird. If it speaks of mountains, render those mountains. If it captures rain, show the rain falling.

Interpret the haiku's:
- Central image or subject (what is physically described)
- Movement or stillness suggested
- Emotional weight (lightness, heaviness, solitude, connection)
- The moment being captured (dawn, dusk, a fleeting instant)

Art style: Traditional sumi-e (ink wash) painting. Monochromatic black ink on rice paper. Expressive brushstrokes with varying ink densities. Generous negative space (ma). Zen minimalism. But the SUBJECT must emerge entirely from the haiku verses above.

Technique: Wet-on-wet ink effects, spontaneous brush movements, fading gradients. The subject emerges from mist or void.

CRITICAL: Absolutely NO text, letters, characters, kanji, hiragana, katakana, or any written symbols in the image. Pure visual art only.`;

  const response = await openai.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5',
    n: 1,
    output_format: 'png',
    prompt: prompt,
    quality: process.env.OPENAI_IMAGE_QUALITY || 'high',
    size: '1024x1024',
    user: 'gutenku-sumie-theme',
  });

  const imageBase64 = response.data[0].b64_json;

  if (!imageBase64) {
    throw new Error('No image data returned from GPT-Image API');
  }

  return Buffer.from(imageBase64, 'base64');
}
