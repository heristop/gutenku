import { readdir } from 'fs/promises';
import { join } from 'path';
import Canvas from 'canvas';
import { HaikuValue } from '../types';

export default {
  async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
    const verses = haiku.verses;
    Canvas.registerFont('./src/shared/assets/fonts/Yomogi-Regular.ttf', {
      family: 'Yomogi',
    });

    const canvas = Canvas.createCanvas(2400, 2400);
    const ctx = canvas.getContext('2d');

    const folderPath = './src/shared/assets/themes/paper/backgrounds';
    const files = await readdir(folderPath);

    const randomIndex = Math.floor(Math.random() * files.length);
    const randomFile = files[randomIndex];
    const imagePath = join(folderPath, randomFile);

    const background = new Canvas.Image();
    background.src = imagePath;
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Load the logo
    const logo = new Canvas.Image();
    logo.src = './src/shared/assets/themes/paper/logo/gutenku_white.png';

    // Draw the logo
    ctx.globalAlpha = 0.25;
    ctx.drawImage(
      logo,
      canvas.width - logo.width + 20,
      canvas.height - logo.height - 10,
      logo.width * 0.85,
      logo.height * 0.85,
    );
    ctx.globalAlpha = 1;

    // Set the font and background color
    ctx.font = '130px Yomogi';
    ctx.fillStyle = '#fff';

    // Draw the text
    ctx.globalAlpha = 0.8;

    const x = 244;
    let y = canvas.height / 3.5;
    verses.map((verse) => {
      ctx.fillText(verse, x, y);
      y = y + 440;
    });

    return canvas;
  },
};
