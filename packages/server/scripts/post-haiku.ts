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
import {
  post as socialPost,
  generateSocialCaption,
} from '~/application/services/SocialService';

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
  .option('-p, --platform <type>', 'platform (discord or social)', 'discord')
  .option('--with-image-ai', 'use AI-generated themes for random', false)
  .option('--no-interaction')
  .option('--no-ai-description')
  .option('--no-post');

program.parse();

const options = program.opts();

const query = `
    query Query(
        $useAi: Boolean,
        $useCache: Boolean,
        $appendImg: Boolean,
        $useImageAI: Boolean,
        $selectionCount: Int,
        $theme: String
    ) {
        haiku(
            useAI: $useAi,
            useCache: $useCache,
            appendImg: $appendImg,
            useImageAI: $useImageAI,
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
            selectionInfo {
                requestedCount
                generatedCount
                selectedIndex
                reason
            }
            candidates {
                verses
                book {
                    title
                    author
                }
            }
        }
    }
`;

const variables = {
  appendImg: true,
  selectionCount: options.selectionCount
    ? Number.parseInt(options.selectionCount, 10)
    : undefined,
  theme: options.theme,
  useAi: options.aiDescription,
  useImageAI: options.withImageAi,
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
  console.log(pc.dim(`Platform: ${options.platform}`));
  console.log(
    pc.dim(`AI Description: ${options.aiDescription ? 'yes' : 'no'}`),
  );
  console.log(pc.dim(`ImageAI: ${options.withImageAi ? 'yes' : 'no'}`));
  console.log(pc.dim(`Interactive: ${options.interaction ? 'yes' : 'no'}`));
  console.log(
    pc.dim(`Selection Count: ${variables.selectionCount ?? 'default'}`),
  );

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

  if (haiku.selectionInfo) {
    const { generatedCount, selectedIndex } = haiku.selectionInfo;
    generateSpinner.succeed(
      pc.green(`Haiku generated`) +
        pc.dim(
          ` (${generatedCount} candidates, selected #${selectedIndex + 1})`,
        ),
    );
  } else {
    generateSpinner.succeed(pc.green('Haiku generated'));
  }

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

  // Display all candidates if available
  if (haiku.candidates && haiku.candidates.length > 1 && haiku.selectionInfo) {
    console.log(pc.bold('\n═══ All Candidates ═══\n'));
    const selectedIndex = haiku.selectionInfo.selectedIndex;

    haiku.candidates.forEach((candidate, i) => {
      const isSelected = i === selectedIndex;
      const marker = isSelected ? pc.green('★ SELECTED') : '';
      const indexStr = isSelected
        ? pc.green(pc.bold(`#${i + 1}`))
        : pc.dim(`#${i + 1}`);
      const bookInfo = pc.dim(`(${candidate.book.title})`);

      console.log(`${indexStr} ${marker} ${bookInfo}`);
      candidate.verses.forEach((verse) => {
        const verseText = isSelected
          ? pc.cyan(`  ${verse}`)
          : pc.dim(`  ${verse}`);
        console.log(verseText);
      });
      console.log();
    });

    if (haiku.selectionInfo.reason) {
      console.log(pc.yellow('💡 Selection reason:'));
      console.log(pc.italic(`   ${haiku.selectionInfo.reason}\n`));
    }
  }

  // Display preview
  console.log(pc.bold('═══ Generated Haiku ═══\n'));

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

  // Handle social platform (generates caption file only, no Discord post)
  if (options.platform === 'social') {
    const socialSpinner = ora('Generating social caption...').start();
    const socialCaption = generateSocialCaption(haiku);
    const captionPath = path.join(DATA_DIRECTORY, 'social_caption.txt');
    await fs.writeFile(captionPath, socialCaption);
    socialSpinner.succeed(pc.green('Social caption generated'));

    console.log(pc.bold('\n═══ Social Caption ═══\n'));
    console.log(socialCaption);
    console.log(pc.dim(`\nSaved to: ${captionPath}`));
    console.log(pc.bold(pc.green('\n✨ Done!\n')));
    process.exit(0);
  }

  // Post to Discord
  if (options.interaction === false) {
    const postSpinner = ora('Posting to Discord...').start();
    await socialPost(haiku);
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
          await socialPost(haiku);
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
