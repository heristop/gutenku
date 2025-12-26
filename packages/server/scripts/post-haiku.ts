import 'reflect-metadata';
import dotenv from 'dotenv';
import log from 'loglevel';
import fetch from 'node-fetch';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { program } from 'commander';
import { createInterface } from 'node:readline';
import terminalImage from 'terminal-image';
import type { HaikuResponseData } from '~/shared/types';
import { post as discordPost } from '~/application/services/DiscordService';

dotenv.config();
log.enableAll();

const DATA_DIRECTORY = './data';

program
  .option(
    '-c, --selection-count <type>',
    'number of haiku selection',
    process.env.OPENAI_SELECTION_COUNT,
  )
  .option('-t, --theme <type>', 'theme', 'random')
  .option('--no-interaction')
  .option('--no-openai')
  .option('--no-post');

program.parse();

const options = program.opts();

const query = `
    query Query(
        $useAi: Boolean,
        $useCache: Boolean,
        $appendImg: Boolean,
        $selectionCount: Int,
        $theme: String
    ) {
        haiku(
            useAI: $useAi,
            useCache: $useCache,
            appendImg: $appendImg,
            selectionCount: $selectionCount,
            theme: $theme
        ) {
            book {
                title
                author
                emoticons
            }
            verses
            title
            description
            image
            hashtags
            translations {
                fr
                jp
                es
                it
                de
            }
        }
    }
`;

const variables = {
  appendImg: true,
  selectionCount: Number.parseInt(options.selectionCount),
  theme: options.theme,
  useAi: options.openai,
  useCache: true,
};

const body = {
  query: query,
  timeout: 100,
  variables: variables,
};

fetch(process.env.SERVER_URI || 'http://localhost:4000/graphql', {
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
})
  .then((response) => response.json())
  .then(async (response: { data: HaikuResponseData }) => {
    const haiku = response.data?.haiku;

    if (haiku === null) {
      log.error(response);

      throw new Error('Haiku fetch error');
    }

    const imageData = Buffer.from(haiku.image, 'base64');

    // Inline preview in terminal from buffer for compatibility with newer terminal-image
    try {
      const preview = await terminalImage.buffer(imageData, { width: 20 });
      log.info(preview);
    } catch {
      // Fallback to file preview if buffer rendering is unavailable
      try {
        haiku.imagePath = path.join(DATA_DIRECTORY, 'preview_haiku.jpg');
        await fs.writeFile(haiku.imagePath, imageData);
        const ti = terminalImage as unknown as {
          file?: (p: string, opts: { width: number }) => Promise<string>;
        };
        const previewFromFile = await ti.file?.(haiku.imagePath, { width: 20 });
        if (previewFromFile) {
          log.info(previewFromFile);
        }
      } catch {
        // Ignore preview errors
      }
    }

    // Persist preview image to disk for subsequent steps
    haiku.imagePath =
      haiku.imagePath || path.join(DATA_DIRECTORY, 'preview_haiku.jpg');
    await fs.writeFile(haiku.imagePath, imageData);
    log.info({
      book: haiku.book,
      description: haiku.description,
      hashtags: haiku.hashtags,
      title: haiku.title,
      translations: haiku.translations,
      verses: haiku.verses,
    });

    const imageBuffer = await fs.readFile(haiku.imagePath);

    // Resize generated image for Readme Daily Haiku Card section
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(1000, 1000)
      .toBuffer();

    await fs.writeFile(
      path.join(DATA_DIRECTORY, 'daily_haiku_card.jpg'),
      resizedImageBuffer,
    );

    if (haiku.description) {
      await fs.writeFile(
        path.join(DATA_DIRECTORY, 'description.txt'),
        haiku.description,
      );
    }

    if (options.interaction === false) {
      discordPost(haiku);

      return;
    }

    if (options.post === true) {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const timeout = setTimeout(() => {
        log.info('\nNo input received, closing...');
        rl.close();
        process.exit();
      }, 10000); // Wait for 10 seconds

      rl.question(
        '\nPost on Discord? (y/n) \x1b[33m[n]\x1b[0m ',
        async (answer: string) => {
          clearTimeout(timeout); // Cancel the timeout if input is received

          if (answer === 'y' || answer === 'yes') {
            await discordPost(haiku);
          }

          rl.close();
        },
      );
    }
  });
