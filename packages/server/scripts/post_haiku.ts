import 'reflect-metadata';
import dotenv from 'dotenv';
import log from 'loglevel';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { program } from 'commander';
import { createInterface } from 'readline';
import terminalImage from 'terminal-image';
import { HaikuResponseData } from '../src/shared/types';
import DiscordService from '../src/application/services/DiscordService';

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
  useAi: options.openai,
  useCache: true,
  appendImg: true,
  selectionCount: parseInt(options.selectionCount),
  theme: options.theme,
};

const body = {
  query: query,
  variables: variables,
  timeout: 100,
};

fetch(process.env.SERVER_URI || 'http://localhost:4000/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})
  .then((response) => response.json())
  .then(async (response: { data: HaikuResponseData }) => {
    const haiku = response.data?.haiku;

    if (null === haiku) {
      log.error(response);

      throw new Error('Haiku fetch error');
    }

    const imageData = Buffer.from(haiku.image, 'base64');

    haiku.imagePath = path.join(DATA_DIRECTORY, 'preview_haiku.jpg');

    await fs.writeFile(haiku.imagePath, imageData);

    log.info(await terminalImage.file(haiku.imagePath, { width: 20 }));
    log.info({
      book: haiku.book,
      verses: haiku.verses,
      title: haiku.title,
      description: haiku.description,
      hashtags: haiku.hashtags,
      translations: haiku.translations,
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

    if (false === options.interaction) {
      DiscordService.post(haiku);

      return;
    }

    if (true === options.post) {
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

          if ('y' === answer || 'yes' === answer) {
            await DiscordService.post(haiku);
          }

          rl.close();
        },
      );
    }
  });
