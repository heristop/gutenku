import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import Canvas from 'canvas';
import type { HaikuValue } from '~/shared/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  drawImageCover,
} from '~/shared/constants/canvas';

export default {
  async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
    const { verses } = haiku;
    Canvas.registerFont(
      './src/shared/assets/fonts/NanumBrushScript-Regular.ttf',
      { family: 'NanumBrushScript' },
    );

    const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    const folderPath = './src/shared/assets/themes/greentea/backgrounds';
    const files = await readdir(folderPath);

    const randomIndex = Math.floor(Math.random() * files.length);
    const randomFile = files[randomIndex];
    const imagePath = join(folderPath, randomFile);

    const background = new Canvas.Image();
    background.src = imagePath;
    drawImageCover(ctx, background, canvas.width, canvas.height);

    ctx.font = '155px NanumBrushScript';
    ctx.fillStyle = '#2F5D62';
    ctx.globalAlpha = 0.84;

    const x = 250;
    let y = canvas.height / 4;
    verses.map((verse) => {
      ctx.fillText(verse, x, y);
      y += 420;
    });

    const decor = new Canvas.Image();
    decor.src = './src/shared/assets/themes/greentea/decoration/torn_paper.png';

    ctx.globalAlpha = 1;
    drawImageCover(ctx, decor, canvas.width, canvas.height);

    const pic = new Canvas.Image();
    pic.src = await catchNaturePic();

    ctx.globalAlpha = 0.92;
    ctx.drawImage(
      pic,
      canvas.width - pic.width - 400,
      canvas.height - pic.height - 420,
      pic.width,
      pic.height,
    );

    ctx.font = '132px NanumBrushScript';
    ctx.globalAlpha = 0.6;
    ctx.fillText('- GutenKu', canvas.width - 780, canvas.height - 240);

    return canvas;
  },
};

async function catchNaturePic() {
  const folderPath = './src/shared/assets/themes/greentea/nature';
  const files = await readdir(folderPath);

  const randomIndex = Math.floor(Math.random() * files.length);
  const randomFile = files[randomIndex];

  return join(folderPath, randomFile);
}
