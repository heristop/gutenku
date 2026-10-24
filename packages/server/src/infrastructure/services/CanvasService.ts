import fs from 'node:fs';
import Canvas from 'canvas';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('canvas');
import { promisify } from 'node:util';
import { singleton } from 'tsyringe';
import type { HaikuValue } from '~/shared/types';
import greentea from '~/shared/themes/greentea';
import watermark from '~/shared/themes/watermark';
import nihonga from '~/shared/themes/nihonga';
import sumie from '~/shared/themes/sumie';
import ukiyoe from '~/shared/themes/ukiyoe';
import zengarden from '~/shared/themes/zengarden';
import wabisabi from '~/shared/themes/wabisabi';
import bookzen from '~/shared/themes/bookzen';
import exlibris from '~/shared/themes/exlibris';
import catalogue from '~/shared/themes/catalogue';
import frontispiece from '~/shared/themes/frontispiece';
import {
  AI_IMAGE_THEMES,
  type ThemeCreateOptions,
} from '~/shared/themes/ai-image';
import type { ImagePreviewHandler } from '~/domain/services/ICanvasService';

type ThemeCreator = (
  haiku: HaikuValue,
  options?: ThemeCreateOptions,
) => Promise<Canvas.Canvas>;

// Width of the drafts sent while an AI background is still being painted
const PREVIEW_WIDTH = 480;
const PREVIEW_QUALITY = 0.7;

@singleton()
export default class CanvasService {
  private readonly DATA_DIRECTORY = './data';
  private theme!: string;

  useTheme(theme: string): void {
    this.theme = theme;
  }

  private static readonly STATIC_THEMES = [
    'catalogue',
    'greentea',
    'watermark',
    'exlibris',
    'frontispiece',
  ] as const;

  private static readonly AI_THEMES = AI_IMAGE_THEMES;

  private static readonly THEME_CREATORS: Record<string, ThemeCreator> = {
    greentea: greentea.create,
    watermark: watermark.create,
    nihonga: nihonga.create,
    sumie: sumie.create,
    ukiyoe: ukiyoe.create,
    zengarden: zengarden.create,
    wabisabi: wabisabi.create,
    bookzen: bookzen.create,
    exlibris: exlibris.create,
    catalogue: catalogue.create,
    frontispiece: frontispiece.create,
  };

  private pickRandomTheme(useImageAI: boolean): string {
    const themes = useImageAI
      ? CanvasService.AI_THEMES
      : CanvasService.STATIC_THEMES;
    const randomIndex = Math.floor(Math.random() * themes.length);

    return themes[randomIndex];
  }

  private resolveCreator(themeName: string): ThemeCreator {
    const creator = CanvasService.THEME_CREATORS[themeName];

    if (!creator) {
      throw new Error(`Unsupported theme: ${themeName}`);
    }

    return creator;
  }

  async create(
    haiku: HaikuValue,
    useImageAI: boolean = false,
    onPreview?: ImagePreviewHandler,
  ): Promise<string> {
    log.info({ theme: this.theme, useImageAI }, 'Crafting image');

    if (this.theme === 'random') {
      this.theme = this.pickRandomTheme(useImageAI);
      log.info(
        { selectedTheme: this.theme, useImageAI },
        'Random theme selected',
      );
    }

    const createCanvas = this.resolveCreator(this.theme);

    try {
      const canvas = await createCanvas(haiku, {
        onPreview: onPreview && ((draft) => onPreview(this.toPreview(draft))),
      });

      Canvas.deregisterAllFonts();

      return this.save(canvas);
    } catch (err) {
      log.error({ err }, 'Failed to create canvas');
      throw err;
    }
  }

  private toPreview(canvas: Canvas.Canvas): string {
    const height = Math.round((canvas.height / canvas.width) * PREVIEW_WIDTH);
    const preview = Canvas.createCanvas(PREVIEW_WIDTH, height);

    preview.getContext('2d').drawImage(canvas, 0, 0, PREVIEW_WIDTH, height);

    return preview
      .toBuffer('image/jpeg', { quality: PREVIEW_QUALITY })
      .toString('base64');
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
      data,
    };
  }
}
