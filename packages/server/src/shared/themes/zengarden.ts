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
    Canvas.registerFont('./src/shared/assets/fonts/IndieFlower-Regular.ttf', {
      family: 'IndieFlower',
    });

    const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    const backgroundImageData = await generateZenGardenBackground(haiku);
    const background = await Canvas.loadImage(backgroundImageData);

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#f0ead6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.88;
    drawImageCover(ctx, background, canvas.width, canvas.height);

    // Strong overlay to soften background for text readability
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#f0ead6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 140px IndieFlower';
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
    ctx.font = 'bold 130px IndieFlower';
    ctx.fillStyle = '#2d4a2d';
    ctx.fillText('- GutenKu', canvas.width - 660, canvas.height - 280);

    return canvas;
  },
};

async function generateZenGardenBackground(haiku: HaikuValue): Promise<Buffer> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `THE HAIKU IS YOUR PRIMARY INSPIRATION. Study these verses deeply and express their meaning through a zen garden:

"${haiku.verses[0]}"
"${haiku.verses[1]}"
"${haiku.verses[2]}"

CRITICAL: The garden must be an ABSTRACT representation of these three lines. Translate the haiku's imagery into stones, raked patterns, and moss. If the haiku speaks of water, let the raked sand ripple like that water. If it mentions mountains, let the stones embody those peaks. If it captures stillness, make the garden profoundly still.

Interpret the haiku's:
- Core emotion or philosophical insight
- Natural imagery to translate into stone and sand
- Sense of movement or stillness
- The balance between presence and absence (what is said vs. unsaid)

Art style: Minimalist Japanese rock garden (karesansui). Raked white/cream gravel with concentric and linear patterns. Weathered stones, moss patches. But the ARRANGEMENT and FEELING must emerge from the haiku verses above.

Palette: Soft sand beige, moss green, stone gray, cream white, earthy browns

Mood: Whatever mood the haiku evokes - tranquil, melancholic, hopeful, mysterious.

Composition: Bird's eye or elevated view. Asymmetrical balance. Generous negative space.

CRITICAL: Absolutely NO text, letters, characters, kanji, hiragana, katakana, or any written symbols in the image. Pure visual art only.`;

  const response = await openai.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5',
    n: 1,
    output_format: 'png',
    prompt: prompt,
    quality: process.env.OPENAI_IMAGE_QUALITY || 'high',
    size: '1024x1024',
    user: 'gutenku-zengarden-theme',
  });

  const imageBase64 = response.data[0].b64_json;

  if (!imageBase64) {
    throw new Error('No image data returned from GPT-Image API');
  }

  return Buffer.from(imageBase64, 'base64');
}
