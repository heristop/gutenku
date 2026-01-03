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
    const verses = haiku.verses;
    Canvas.registerFont('./src/shared/assets/fonts/Yomogi-Regular.ttf', {
      family: 'Yomogi',
    });

    const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    const folderPath = './src/shared/assets/themes/paper/backgrounds';
    const files = await readdir(folderPath);

    const randomIndex = Math.floor(Math.random() * files.length);
    const randomFile = files[randomIndex];
    const imagePath = join(folderPath, randomFile);

    const background = new Canvas.Image();
    background.src = imagePath;
    drawImageCover(ctx, background, canvas.width, canvas.height);

    const logo = new Canvas.Image();
    logo.src = './src/shared/assets/themes/paper/logo/gutenku_white.png';

    ctx.globalAlpha = 0.25;
    ctx.drawImage(
      logo,
      canvas.width - logo.width * 0.8 - 220,
      canvas.height - logo.height * 0.8 - 180,
      logo.width * 0.8,
      logo.height * 0.8,
    );
    ctx.globalAlpha = 1;

    ctx.font = 'bold 120px Yomogi';
    ctx.fillStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;

    const x = 250;
    let y = canvas.height / 4;
    verses.forEach((verse) => {
      ctx.fillText(verse, x, y);
      y += 480;
    });

    return canvas;
  },
};
