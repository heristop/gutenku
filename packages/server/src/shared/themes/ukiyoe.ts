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
    const backgroundImageData = await generateUkiyoeBackground(
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
  Canvas.registerFont('./src/shared/assets/fonts/Yomogi-Regular.ttf', {
    family: 'Yomogi',
  });

  const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff8e7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
}

async function generateUkiyoeBackground(
  haiku: HaikuValue,
  onPartial?: PartialImageHandler,
): Promise<Buffer | null> {
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

  return generateThemeBackground('ukiyoe', prompt, onPartial);
}
