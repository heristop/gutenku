#!/usr/bin/env node
import 'reflect-metadata';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pc from 'picocolors';
import ora from 'ora';
import { program } from 'commander';
import { createInterface } from 'node:readline';
import terminalImage from 'terminal-image';
import type { HaikuResponseData } from '~/shared/types';
import { post as discordPost } from '~/application/services/DiscordService';

dotenv.config();

const DATA_DIRECTORY = './data';

program
  .name('post-haiku')
  .description('Generate and post a haiku to Discord')
  .version('1.0.0')
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
  selectionCount: Number.parseInt(options.selectionCount, 10),
  theme: options.theme,
  useAi: options.openai,
  useCache: true,
};

const body = {
  query: query,
  timeout: 100,
  variables: variables,
};

try {
  console.log(pc.bold('\n📮 Haiku Post\n'));

  // Show options
  console.log(pc.dim(`Theme: ${options.theme}`));
  console.log(pc.dim(`OpenAI: ${options.openai ? 'yes' : 'no'}`));
  console.log(pc.dim(`Interactive: ${options.interaction ? 'yes' : 'no'}`));

  // Generate haiku with spinner
  const generateSpinner = ora('Generating haiku with image...').start();

  const response = await fetch(
    process.env.SERVER_URI || 'http://localhost:4000/graphql',
    {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  );

  const data = (await response.json()) as { data: HaikuResponseData };
  const haiku = data.data?.haiku;

  if (!haiku) {
    generateSpinner.fail(pc.red('Failed to generate haiku'));
    console.error(pc.red('\nError response:'), data);
    process.exit(1);
  }

  generateSpinner.succeed(pc.green('Haiku generated'));

  // Process image
  const imageSpinner = ora('Processing image...').start();

  const imageData = Buffer.from(haiku.image, 'base64');
  haiku.imagePath = path.join(DATA_DIRECTORY, 'preview_haiku.jpg');
  await fs.writeFile(haiku.imagePath, imageData);

  // Resize for daily card
  const imageBuffer = await fs.readFile(haiku.imagePath);
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

  imageSpinner.succeed(pc.green('Image processed'));

  // Display preview
  console.log(pc.bold('\n═══ Generated Haiku ═══\n'));

  // Terminal image preview
  try {
    const preview = await terminalImage.buffer(imageData, { width: 40 });
    console.log(preview);
  } catch {
    console.log(pc.dim('  [Image preview not available]'));
  }

  // Haiku details
  console.log(pc.cyan('  ' + haiku.verses.join('\n  ')));
  console.log(pc.dim(`\n  — ${haiku.book.title}`));
  console.log(pc.dim(`    by ${haiku.book.author}`));

  if (haiku.title) {
    console.log(`\n${pc.dim('Title:')} ${haiku.title}`);
  }
  if (haiku.description) {
    console.log(`${pc.dim('Description:')} ${haiku.description}`);
  }
  if (haiku.hashtags) {
    console.log(`${pc.dim('Hashtags:')} ${pc.blue(haiku.hashtags)}`);
  }

  // Translations
  if (haiku.translations) {
    console.log(pc.bold('\n═══ Translations ═══\n'));
    if (haiku.translations.fr) {
      console.log(`${pc.dim('FR:')} ${haiku.translations.fr}`);
    }
    if (haiku.translations.jp) {
      console.log(`${pc.dim('JP:')} ${haiku.translations.jp}`);
    }
    if (haiku.translations.es) {
      console.log(`${pc.dim('ES:')} ${haiku.translations.es}`);
    }
    if (haiku.translations.it) {
      console.log(`${pc.dim('IT:')} ${haiku.translations.it}`);
    }
    if (haiku.translations.de) {
      console.log(`${pc.dim('DE:')} ${haiku.translations.de}`);
    }
  }

  // Post to Discord
  if (options.interaction === false) {
    const postSpinner = ora('Posting to Discord...').start();
    await discordPost(haiku);
    postSpinner.succeed(pc.green('Posted to Discord'));
    console.log(pc.bold(pc.green('\n✨ Done!\n')));
    process.exit(0);
  }

  if (options.post === true) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const timeout = setTimeout(() => {
      console.log(pc.yellow('\n⏱ No input received, closing...'));
      rl.close();
      process.exit(0);
    }, 10000);

    rl.question(
      `\n${pc.bold('Post on Discord?')} ${pc.dim('(y/n)')} ${pc.yellow('[n]')} `,
      async (answer: string) => {
        clearTimeout(timeout);

        if (answer === 'y' || answer === 'yes') {
          const postSpinner = ora('Posting to Discord...').start();
          await discordPost(haiku);
          postSpinner.succeed(pc.green('Posted to Discord'));
        } else {
          console.log(pc.dim('\nSkipped posting.'));
        }

        console.log(pc.bold(pc.green('\n✨ Done!\n')));
        rl.close();
        process.exit(0);
      },
    );
  } else {
    console.log(pc.bold(pc.green('\n✨ Done!\n')));
    process.exit(0);
  }
} catch (error) {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
}
