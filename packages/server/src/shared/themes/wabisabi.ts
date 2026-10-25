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
    const backgroundImageData = await generateWabiSabiBackground(
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
  Canvas.registerFont('./src/shared/assets/fonts/ZenKurenaido-Regular.ttf', {
    family: 'ZenKurenaido',
  });

  const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#e8dcc4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (backgroundImageData) {
    const background = await Canvas.loadImage(backgroundImageData);
    ctx.globalAlpha = 0.82;
    drawImageCover(ctx, background, canvas.width, canvas.height);
  }

  ctx.globalAlpha = 0.75;
  ctx.fillStyle = '#e8dcc4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 128px ZenKurenaido';
  ctx.globalAlpha = 1;

  const x = 200;
  let y = canvas.height / 4;

  verses.map((verse) => {
    ctx.strokeStyle = 'rgba(232, 220, 196, 0.9)';
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';
    ctx.strokeText(verse, x, y);
    ctx.fillStyle = '#0a0a14';
    ctx.fillText(verse, x, y);
    y += 420;
  });

  ctx.font = 'bold 123px ZenKurenaido';
  ctx.strokeStyle = 'rgba(232, 220, 196, 0.85)';
  ctx.lineWidth = 8;
  ctx.lineJoin = 'round';
  ctx.strokeText('- GutenKu', canvas.width - 780, canvas.height - 240);
  ctx.fillStyle = '#4a2f1a';
  ctx.fillText('- GutenKu', canvas.width - 780, canvas.height - 240);

  return canvas;
}

async function generateWabiSabiBackground(
  haiku: HaikuValue,
  onPartial?: PartialImageHandler,
): Promise<Buffer | null> {
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

  return generateThemeBackground('wabisabi', prompt, onPartial);
}
