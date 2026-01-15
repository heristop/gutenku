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
    ctx.fillStyle = '#f0ead6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const backgroundImageData = await generateZenGardenBackground(haiku);
    if (backgroundImageData) {
      const background = await Canvas.loadImage(backgroundImageData);
      ctx.globalAlpha = 0.88;
      drawImageCover(ctx, background, canvas.width, canvas.height);
    }

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#f0ead6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 128px IndieFlower';
    ctx.globalAlpha = 1;

    const x = 250;
    let y = canvas.height / 4;

    verses.map((verse) => {
      ctx.strokeStyle = 'rgba(240, 234, 214, 0.9)';
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.strokeText(verse, x, y);
      ctx.fillStyle = '#0a0a14';
      ctx.fillText(verse, x, y);
      y += 420;
    });

    ctx.font = 'bold 118px IndieFlower';
    ctx.strokeStyle = 'rgba(240, 234, 214, 0.85)';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.strokeText('- GutenKu', canvas.width - 780, canvas.height - 240);
    ctx.fillStyle = '#2d4a2d';
    ctx.fillText('- GutenKu', canvas.width - 780, canvas.height - 240);

    return canvas;
  },
};

async function generateZenGardenBackground(
  haiku: HaikuValue,
): Promise<Buffer | null> {
  try {
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
      quality: (process.env.OPENAI_IMAGE_QUALITY || 'high') as
        | 'high'
        | 'low'
        | 'medium'
        | 'auto',
      size: '1024x1536',
      user: 'gutenku-zengarden-theme',
    });

    const imageBase64 = response.data[0].b64_json;

    if (!imageBase64) {
      console.error('No image data returned from OpenAI GPT-Image API');

      return null;
    }

    return Buffer.from(imageBase64, 'base64');
  } catch (error) {
    console.error('OpenAI image generation failed for zengarden theme:', error);

    return null;
  }
}
