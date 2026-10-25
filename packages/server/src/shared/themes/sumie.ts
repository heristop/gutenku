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
    const backgroundImageData = await generateSumieBackground(
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
  Canvas.registerFont(
    './src/shared/assets/fonts/NanumBrushScript-Regular.ttf',
    { family: 'NanumBrushScript' },
  );

  const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#f5f5dc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (backgroundImageData) {
    const background = await Canvas.loadImage(backgroundImageData);
    ctx.globalAlpha = 0.85;
    drawImageCover(ctx, background, canvas.width, canvas.height);
  }

  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#f5f5dc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 150px NanumBrushScript';
  ctx.globalAlpha = 1;

  const x = 250;
  let y = canvas.height / 4;
  verses.map((verse) => {
    ctx.strokeStyle = 'rgba(245, 245, 220, 0.9)';
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';
    ctx.strokeText(verse, x, y);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillText(verse, x, y);
    y += 420;
  });

  ctx.font = 'bold 130px NanumBrushScript';
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(245, 245, 220, 0.85)';
  ctx.lineWidth = 8;
  ctx.lineJoin = 'round';
  ctx.strokeText('- GutenKu', canvas.width - 780, canvas.height - 240);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText('- GutenKu', canvas.width - 780, canvas.height - 240);

  return canvas;
}

async function generateSumieBackground(
  haiku: HaikuValue,
  onPartial?: PartialImageHandler,
): Promise<Buffer | null> {
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

  return generateThemeBackground('sumie', prompt, onPartial);
}
