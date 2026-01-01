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
    Canvas.registerFont('./src/shared/assets/fonts/ZenKurenaido-Regular.ttf', {
      family: 'ZenKurenaido',
    });

    const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    const backgroundImageData = await generateWabiSabiBackground(haiku);
    const background = await Canvas.loadImage(backgroundImageData);

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#e8dcc4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.82;
    drawImageCover(ctx, background, canvas.width, canvas.height);

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#e8dcc4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 160px ZenKurenaido';
    ctx.globalAlpha = 1;

    const x = 180;
    let y = canvas.height / 4;

    verses.map((verse) => {
      ctx.fillStyle = '#0a0a14';
      ctx.fillText(verse, x, y);
      y += 480;
    });

    ctx.font = 'bold 145px ZenKurenaido';
    ctx.fillStyle = '#4a2f1a';
    ctx.fillText('- GutenKu', canvas.width - 750, canvas.height - 280);

    return canvas;
  },
};

async function generateWabiSabiBackground(haiku: HaikuValue): Promise<Buffer> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `THE HAIKU IS YOUR PRIMARY INSPIRATION. Study these verses deeply and reveal their wabi-sabi essence:

"${haiku.verses[0]}"
"${haiku.verses[1]}"
"${haiku.verses[2]}"

CRITICAL: Find the impermanence, the fleeting moment, the humble beauty hidden in these three lines. Then show it through weathered objects that embody the haiku's meaning. If the haiku speaks of time passing, show objects marked by time. If it captures a fragile moment, depict something delicate and worn. If it mentions nature, show nature in its aged, imperfect beauty.

Interpret the haiku's:
- Sense of transience or impermanence
- Humble, overlooked beauty it reveals
- Emotional texture (melancholy, acceptance, wonder)
- The specific objects or scenes mentioned, rendered with age and patina

Philosophy: Wabi-sabi - beauty in imperfection, impermanence, incompleteness. But apply this philosophy to the SPECIFIC content of the haiku above.

Palette: Earthy, muted tones - rust orange, deep ochre, weathered wood brown, moss green, patina verdigris, faded indigo

Texture: Show age and use - peeling paint, oxidized metal, cracked glaze, bark patterns, lichen. Every texture should feel like it has a story connected to the haiku.

Composition: Intimate, close-up views revealing texture and patina. Soft natural lighting.

CRITICAL: Absolutely NO text, letters, characters, kanji, hiragana, katakana, or any written symbols in the image. Pure visual art only.`;

  const response = await openai.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5',
    n: 1,
    output_format: 'png',
    prompt: prompt,
    quality: process.env.OPENAI_IMAGE_QUALITY || 'high',
    size: '1024x1024',
    user: 'gutenku-wabisabi-theme',
  });

  const imageBase64 = response.data[0].b64_json;

  if (!imageBase64) {
    throw new Error('No image data returned from GPT-Image API');
  }

  return Buffer.from(imageBase64, 'base64');
}
