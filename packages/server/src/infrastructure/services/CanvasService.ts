import fs from 'node:fs';
import Canvas from 'canvas';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('canvas');
import { promisify } from 'node:util';
import { singleton } from 'tsyringe';
import type { HaikuValue } from '~/shared/types';
import colored from '~/shared/themes/colored';
import greentea from '~/shared/themes/greentea';
import watermark from '~/shared/themes/watermark';
import nihonga from '~/shared/themes/nihonga';
import sumie from '~/shared/themes/sumie';
import ukiyoe from '~/shared/themes/ukiyoe';
import zengarden from '~/shared/themes/zengarden';
import wabisabi from '~/shared/themes/wabisabi';
import bookzen from '~/shared/themes/bookzen';

@singleton()
export default class CanvasService {
  private readonly DATA_DIRECTORY = './data';
  private theme: string;

  useTheme(theme: string): void {
    this.theme = theme;
  }

  async create(
    haiku: HaikuValue,
    useImageAI: boolean = false,
  ): Promise<string> {
    let createCanvas = null;

    log.info({ theme: this.theme, useImageAI }, 'Crafting image');

    if (this.theme === 'random') {
      const staticThemes = ['colored', 'greentea', 'watermark'];
      const aiThemes = [
        'nihonga',
        'sumie',
        'ukiyoe',
        'zengarden',
        'wabisabi',
        'bookzen',
      ];
      const themes = useImageAI ? aiThemes : staticThemes;
      const randomIndex = Math.floor(Math.random() * themes.length);
      this.theme = themes[randomIndex];
      log.info(
        { selectedTheme: this.theme, useImageAI },
        'Random theme selected',
      );
    }

    switch (this.theme) {
      case 'colored':
        createCanvas = colored.create;
        break;
      case 'greentea':
        createCanvas = greentea.create;
        break;
      case 'watermark':
        createCanvas = watermark.create;
        break;
      case 'nihonga':
        createCanvas = nihonga.create;
        break;
      case 'sumie':
        createCanvas = sumie.create;
        break;
      case 'ukiyoe':
        createCanvas = ukiyoe.create;
        break;
      case 'zengarden':
        createCanvas = zengarden.create;
        break;
      case 'wabisabi':
        createCanvas = wabisabi.create;
        break;
      case 'bookzen':
        createCanvas = bookzen.create;
        break;
      default:
        throw new Error(`Unsupported theme: ${this.theme}`);
    }

    try {
      const canvas = await createCanvas(haiku);

      Canvas.deregisterAllFonts();

      return this.save(canvas);
    } catch (err) {
      log.error({ err }, 'Failed to create canvas');
      throw err;
    }
  }

  async save(canvas: Canvas.Canvas): Promise<string> {
    return new Promise<string>((resolve) => {
      const imagePath = `${this.DATA_DIRECTORY}/haiku_${(Math.random() + 1).toString(36).substring(7)}.jpg`;

      const stream = canvas.createJPEGStream();
      const out = fs.createWriteStream(imagePath);

      stream.pipe(out);
      out.on('finish', () => {
        log.info({ imagePath }, 'Image created');

        resolve(imagePath);
      });
    });
  }

  async read(
    imagePath: string,
  ): Promise<{ data: Buffer; contentType: string }> {
    const readFile = promisify(fs.readFile);
    const data = await readFile(imagePath);

    return {
      contentType: 'image/jpeg',
      data: data,
    };
  }
}
