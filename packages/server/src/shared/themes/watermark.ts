import { readdir } from 'fs/promises';
import { join } from 'path';
import Canvas from 'canvas';
import { HaikuValue } from '../types';
import HaikuContextHelper from '../helpers/HaikuHelper';

export default {
  async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
    const { verses, rawVerses, chapter } = haiku;
    let { context } = haiku;

    Canvas.registerFont('./src/shared/assets/fonts/JMH Typewriter.ttf', {
      family: 'Typewriter',
    });

    const canvas = Canvas.createCanvas(2400, 2400);
    const ctx = canvas.getContext('2d');

    // Set background image
    const folderPath = './src/shared/assets/themes/greentea/backgrounds';
    const files = await readdir(folderPath);
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const imagePath = join(folderPath, randomFile);
    const background = new Canvas.Image();
    background.src = imagePath;
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Set font and styles
    ctx.font = '112px Typewriter';

    ctx.globalAlpha = 0.2;

    // Setup coord
    const lineHeight = 380;
    const baseX = 244;
    const baseY = (canvas.height - lineHeight * verses.length) / 1.7;

    if (!context) {
      context = HaikuContextHelper.extractContextVerses(rawVerses, chapter.content);
    }

    // Draw context lines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';

    context.forEach((contextItem, i) => {
      const ghostVerse = verses[i];
      const y = baseY + lineHeight * i;

      const beforeVerse = contextItem.wordsBefore?.trim() ?? '';
      const afterVerse = contextItem.wordsAfter?.trim() ?? '';
      const sentenceBefore = contextItem.sentenceBefore ?? '';
      const sentenceAfter = contextItem.sentenceAfter ?? '';

      const beforeVerseWidth = ctx.measureText(beforeVerse).width;

      ctx.fillText(beforeVerse, ctx.measureText(beforeVerse).width * -1 + 192, y);

      // Set transparent color for rawVerse
      ctx.fillStyle = 'rgba(0, 0, 0, 0.0)';
      ctx.fillText(ghostVerse, ctx.measureText(beforeVerse).width * -1 + 240 + beforeVerseWidth, y);

      // Restore previous color for afterVerse
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillText(
        afterVerse,
        ctx.measureText(beforeVerse).width * -1 + 250 + beforeVerseWidth + ctx.measureText(ghostVerse).width,
        y,
      );

      // Draw header and footer lines
      if (i === 0) {
        ctx.fillText(sentenceBefore, (ctx.measureText(sentenceBefore).width / 4) * -1, baseY - lineHeight);
      } else if (i === 2 && sentenceAfter) {
        ctx.fillText(sentenceAfter, (ctx.measureText(sentenceAfter).width / 4) * -1, y + lineHeight);
      }
    });

    // Draw main verses
    ctx.fillStyle = '#2F5D62';
    ctx.globalAlpha = 0.84;
    let verseY = baseY;

    verses.forEach((verse) => {
      ctx.fillText(verse, baseX, verseY);
      verseY += lineHeight;
    });

    // Draw decor
    const decor = new Canvas.Image();
    decor.src = './src/shared/assets/themes/greentea/decoration/torn_paper.png';
    ctx.globalAlpha = 1.0;
    ctx.drawImage(decor, 0, 0, canvas.width, canvas.height);

    // Draw signature
    ctx.font = '110px Typewriter';
    ctx.globalAlpha = 0.7;
    ctx.fillText('- GutenKu', canvas.width - 700, canvas.height - 160);

    return canvas;
  },
};
