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
import { capitalizeVerse } from '~/shared/helpers/HaikuHelper';
import {
  post as socialPost,
  generateSocialCaption,
} from '~/application/services/SocialService';
import {
  GRAPHQL_QUERY,
  buildVariables,
  displayCandidates,
  displayQuality,
  displayTranslations,
} from './post-haiku-helpers';

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
  .option(
    '--from-db <number>',
    'fetch N top haikus from database cache (top 10%)',
    '0',
  )
  .option('--live <number>', 'generate N additional live haikus with GA')
  .option('-t, --theme <type>', 'theme', 'random')
  .option('-p, --platform <type>', 'platform (discord or social)', 'discord')
  .option('--with-image-ai', 'use generated themes for random', false)
  .option('--no-interaction')
  .option('--no-ai-description')
  .option('-C, --no-cache', 'skip MongoDB cache, generate fresh')
  .option('--no-post');

// Filter out standalone '--' from argv (pnpm passes it through)
const argv = process.argv.filter((arg) => arg !== '--');
program.parse(argv);

const options = program.opts();
const variables = buildVariables(options);
const body = { query: GRAPHQL_QUERY, variables };

function printRunHeader(): void {
  console.log(pc.bold('\n📮 Haiku Post\n'));

  console.log(pc.dim(`Theme: ${options.theme}`));
  console.log(pc.dim(`Platform: ${options.platform}`));
  console.log(
    pc.dim(`AI Description: ${options.aiDescription ? 'yes' : 'no'}`),
  );
  console.log(pc.dim(`ImageAI: ${options.withImageAi ? 'yes' : 'no'}`));
  console.log(pc.dim(`Cache: ${options.cache ? 'yes' : 'no'}`));
  console.log(pc.dim(`Interactive: ${options.interaction ? 'yes' : 'no'}`));
  console.log(
    pc.dim(`Selection Count: ${variables.selectionCount ?? 'default'}`),
  );
  console.log(pc.dim(`From DB (top 10%): ${variables.fromDb ?? 0}`));
  console.log(pc.dim(`Live (GA): ${variables.liveCount ?? 'default'}`));
}

async function fetchHaikuPayload(spinner: ReturnType<typeof ora>) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000);

  try {
    const response = await fetch(
      process.env.SERVER_URI || 'http://localhost:4000/graphql',
      {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);
    
return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
if (error instanceof Error && error.name === 'AbortError') {
      spinner.fail(pc.red('Request timed out after 3 minutes'));
      process.exit(1);
    }
    throw error;
  }
}

async function processAndSaveImage(
  haiku: HaikuResponseData['haiku'],
): Promise<void> {
  const imageSpinner = ora('Processing image...').start();

  if (!haiku.image) {
    imageSpinner.fail(pc.red('Haiku image data is missing'));
    process.exit(1);
  }

  const imageData = Buffer.from(haiku.image, 'base64');
  haiku.imagePath = path.join(DATA_DIRECTORY, 'preview_haiku.jpg');
  await fs.writeFile(haiku.imagePath, imageData);

  // Resize for daily card
  const imageBuffer = await fs.readFile(haiku.imagePath);
  const resizedImageBuffer = await sharp(imageBuffer)
    .resize(900, 1125, { fit: 'inside' })
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

  // Generate social preview description (Instagram/Discord format)
  const socialPreviewCaption = generateSocialCaption(haiku);
  await fs.writeFile(
    path.join(DATA_DIRECTORY, 'social-preview-description.txt'),
    socialPreviewCaption,
  );

  imageSpinner.succeed(pc.green('Image processed'));

  try {
    const preview = await terminalImage.buffer(imageData, { width: 50 });
    console.log(preview);
  } catch {
    // Terminal doesn't support image protocol - show file path instead
    console.log(pc.dim(`  📷 Image saved: ${haiku.imagePath}`));
  }
}

function displayHaikuHeader(haiku: HaikuResponseData['haiku']): void {
  console.log(pc.cyan('  ' + haiku.verses.map(capitalizeVerse).join('\n  ')));
  console.log(pc.dim(`\n  — ${haiku.book.title}`));
  console.log(pc.dim(`    by ${haiku.book.author}`));
  
if (haiku.book.emoticons) {
    console.log(`    ${haiku.book.emoticons}`);
  }
}

function displayMetadata(haiku: HaikuResponseData['haiku']): void {
  if (haiku.selectionInfo?.reason) {
    console.log(pc.bold('\n═══ Selection ═══\n'));
    console.log(pc.yellow(`  💡 ${haiku.selectionInfo.reason}`));
  }

  if (haiku.title) {
    console.log(`\n${pc.dim('Title:')} ${haiku.title}`);
  }

  if (haiku.description) {
    console.log(`${pc.dim('Description:')} ${haiku.description}`);
  }

  if (haiku.hashtags) {
    console.log(`${pc.dim('Hashtags:')} ${pc.blue(haiku.hashtags)}`);
  }
}

async function handleSocialPlatform(
  haiku: HaikuResponseData['haiku'],
): Promise<void> {
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

function reportGenerated(
  haiku: HaikuResponseData['haiku'],
  generateSpinner: ReturnType<typeof ora>,
): void {
  if (!haiku.selectionInfo) {
    const cacheStatus = options.cache
      ? pc.dim(' (from cache)')
      : pc.yellow(' [fresh]');
    generateSpinner.succeed(pc.green('Haiku generated') + cacheStatus);
    
return;
  }

  const { requestedCount, generatedCount, selectedIndex } = haiku.selectionInfo;
  const cacheStatus = options.cache ? '' : pc.yellow(' [fresh]');
  generateSpinner.succeed(
    pc.green(`Haiku generated`) +
      pc.dim(
        ` (${requestedCount} requested → ${generatedCount} candidates → selected #${selectedIndex + 1})`,
      ) +
      cacheStatus,
  );
}

function promptToPost(haiku: HaikuResponseData['haiku']): void {
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

      const wantsPost = answer === 'y' || answer === 'yes';

      if (!wantsPost) {
        console.log(pc.dim('\nSkipped posting.'));
      }

      if (wantsPost) {
        const postSpinner = ora('Posting to Discord...').start();
        await socialPost(haiku);
        postSpinner.succeed(pc.green('Posted to Discord'));
      }

      console.log(pc.bold(pc.green('\n✨ Done!\n')));
      rl.close();
      process.exit(0);
    },
  );
}

try {
  printRunHeader();

  const generateSpinner = ora('Generating haiku with image...').start();
  const response = await fetchHaikuPayload(generateSpinner);
  const data = (await response.json()) as { data: HaikuResponseData };
  const haiku = data.data?.haiku;

  if (!haiku) {
    generateSpinner.fail(pc.red('Failed to generate haiku'));
    console.error(pc.red('\nError response:'), data);
    process.exit(1);
  }

  reportGenerated(haiku, generateSpinner);
  await processAndSaveImage(haiku);

  displayCandidates(haiku, options.cache);

  console.log(pc.bold('═══ Generated Haiku ═══\n'));
  displayHaikuHeader(haiku);
  displayQuality(haiku);
  displayMetadata(haiku);
  displayTranslations(haiku);

  // Handle social platform (generates caption file only, no Discord post)
  if (options.platform === 'social') {
    await handleSocialPlatform(haiku);
  }

  if (options.post === false) {
    console.log(pc.bold(pc.green('\n✨ Done!\n')));
    process.exit(0);
  }

  if (options.interaction === false) {
    const postSpinner = ora('Posting to Discord...').start();
    await socialPost(haiku);
    postSpinner.succeed(pc.green('Posted to Discord'));
    console.log(pc.bold(pc.green('\n✨ Done!\n')));
    process.exit(0);
  }

  if (options.post === true) {
    promptToPost(haiku);
  }
} catch (error) {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
}
