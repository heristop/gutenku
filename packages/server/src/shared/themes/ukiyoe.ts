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
    Canvas.registerFont('./src/shared/assets/fonts/Yomogi-Regular.ttf', {
      family: 'Yomogi',
    });

    const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff8e7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const backgroundImageData = await generateUkiyoeBackground(haiku);
    if (backgroundImageData) {
      const background = await Canvas.loadImage(backgroundImageData);
      ctx.globalAlpha = 0.9;
      drawImageCover(ctx, background, canvas.width, canvas.height);
    }

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#fff8e7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 115px Yomogi';
    ctx.globalAlpha = 1;

    const x = 200;
    let y = canvas.height / 4;

    verses.map((verse) => {
      ctx.strokeStyle = 'rgba(255, 248, 231, 0.9)';
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.strokeText(verse, x, y);
      ctx.fillStyle = '#0a0a14';
      ctx.fillText(verse, x, y);
      y += 420;
    });

    ctx.font = 'bold 110px Yomogi';
    ctx.strokeStyle = 'rgba(255, 248, 231, 0.85)';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.strokeText('- GutenKu', canvas.width - 780, canvas.height - 240);
    ctx.fillStyle = '#4a1525';
    ctx.fillText('- GutenKu', canvas.width - 780, canvas.height - 240);

    return canvas;
  },
};

async function generateUkiyoeBackground(
  haiku: HaikuValue,
): Promise<Buffer | null> {
  try {
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
      quality: (process.env.OPENAI_IMAGE_QUALITY || 'high') as
        | 'high'
        | 'low'
        | 'medium'
        | 'auto',
      size: '1024x1536',
      user: 'gutenku-ukiyoe-theme',
    });

    const imageBase64 = response.data[0].b64_json;

    if (!imageBase64) {
      console.error('No image data returned from OpenAI GPT-Image API');

      return null;
    }

    return Buffer.from(imageBase64, 'base64');
  } catch (error) {
    console.error('OpenAI image generation failed for ukiyoe theme:', error);

    return null;
  }
}
