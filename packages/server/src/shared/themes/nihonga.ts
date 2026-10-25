import Canvas from 'canvas';
import type { HaikuValue } from '~/shared/types';
import {
  generateThemeBackground,
  type PartialImageHandler,
  type ThemeCreateOptions,
} from '~/shared/themes/ai-image';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  drawImageCover,
} from '~/shared/constants/canvas';

export default {
  async create(
    haiku: HaikuValue,
    { onPreview }: ThemeCreateOptions = {},
  ): Promise<Canvas.Canvas> {
    const backgroundImageData = await generateNihongaBackground(
      haiku,
      onPreview && (async (draft) => onPreview(await draw(haiku, draft))),
    );

    return draw(haiku, backgroundImageData);
  },
};

async function draw(
  haiku: HaikuValue,
  backgroundImageData: Buffer | null,
): Promise<Canvas.Canvas> {
  const verses = haiku.verses;
  Canvas.registerFont('./src/shared/assets/fonts/IndieFlower-Regular.ttf', {
    family: 'IndieFlower',
  });

  const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');

  ctx.globalAlpha = 1;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
}

async function generateNihongaBackground(
  haiku: HaikuValue,
  onPartial?: PartialImageHandler,
): Promise<Buffer | null> {
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

  return generateThemeBackground('nihonga', prompt, onPartial);
}
