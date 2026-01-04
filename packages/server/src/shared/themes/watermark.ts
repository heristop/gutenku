import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import Canvas from 'canvas';
import type { HaikuValue } from '~/shared/types';
import { extractContextVerses } from '~/shared/helpers/HaikuHelper';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  drawImageCover,
} from '~/shared/constants/canvas';

export default {
  async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
    const { verses, rawVerses, chapter } = haiku;
    let { context } = haiku;

    Canvas.registerFont('./src/shared/assets/fonts/JMH Typewriter.ttf', {
      family: 'Typewriter',
    });

    const canvas = Canvas.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');

    const folderPath = './src/shared/assets/themes/greentea/backgrounds';
    const files = await readdir(folderPath);
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const imagePath = join(folderPath, randomFile);
    const background = new Canvas.Image();
    background.src = imagePath;
    drawImageCover(ctx, background, canvas.width, canvas.height);

    ctx.font = '104px Typewriter';
    ctx.globalAlpha = 0.2;

    const lineHeight = 390;
    const baseX = 250;
    const baseY = (canvas.height - lineHeight * verses.length) / 2;

    if (!context) {
      context = extractContextVerses(rawVerses, chapter.content);
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';

    context.forEach((contextItem, i) => {
      const ghostVerse = verses[i];
      const y = baseY + lineHeight * i;

      const beforeVerse = contextItem.wordsBefore?.trim() ?? '';
      const afterVerse = contextItem.wordsAfter?.trim() ?? '';
      const sentenceBefore = contextItem.sentenceBefore ?? '';
      const sentenceAfter = contextItem.sentenceAfter ?? '';

      const beforeVerseWidth = ctx.measureText(beforeVerse).width;

      ctx.fillText(
        beforeVerse,
        ctx.measureText(beforeVerse).width * -1 + 172,
        y,
      );

      ctx.fillStyle = 'rgba(0, 0, 0, 0.0)';
      ctx.fillText(
        ghostVerse,
        ctx.measureText(beforeVerse).width * -1 + 220 + beforeVerseWidth,
        y,
      );

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillText(
        afterVerse,
        ctx.measureText(beforeVerse).width * -1 +
          230 +
          beforeVerseWidth +
          ctx.measureText(ghostVerse).width,
        y,
      );

      if (i === 0) {
        ctx.fillText(
          sentenceBefore,
          (ctx.measureText(sentenceBefore).width / 4) * -1,
          baseY - lineHeight,
        );
      } else if (i === 2 && sentenceAfter) {
        ctx.fillText(
          sentenceAfter,
          (ctx.measureText(sentenceAfter).width / 4) * -1,
          y + lineHeight,
        );
      }
    });

    ctx.fillStyle = '#2F5D62';
    ctx.globalAlpha = 0.84;
    let verseY = baseY;

    verses.forEach((verse) => {
      ctx.fillText(verse, baseX, verseY);
      verseY += lineHeight;
    });

    const decor = new Canvas.Image();
    decor.src = './src/shared/assets/themes/greentea/decoration/torn_paper.png';
    ctx.globalAlpha = 1;
    drawImageCover(ctx, decor, canvas.width, canvas.height);

    ctx.font = '102px Typewriter';
    ctx.globalAlpha = 0.7;
    ctx.fillText('- GutenKu', canvas.width - 840, canvas.height - 260);

    return canvas;
  },
};
