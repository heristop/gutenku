#!/usr/bin/env node
/**
 * CLI script to generate sumi-e style book covers using OpenAI gpt-image-1.5
 * Run with: pnpm generate:covers
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import OpenAI from 'openai';
import sharp from 'sharp';
import ora from 'ora';
import cliProgress from 'cli-progress';
import pc from 'picocolors';
import { getGutenGuessBooks, type GutenGuessBook } from '~~/data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COVERS_DIR = path.resolve(__dirname, '../../../front/public/covers');

const program = new Command();

program
  .name('generate-covers')
  .description('Generate sumi-e style book covers using OpenAI gpt-image-1.5')
  .version('1.0.0')
  .option('--book <id>', 'Generate cover for a single book by ID')
  .option('--force', 'Regenerate covers even if they exist', false)
  .option('--dry-run', 'Show what would be generated without making API calls')
  .parse(process.argv);

const options = program.opts<{
  book?: string;
  force: boolean;
  dryRun?: boolean;
}>();

function buildPrompt(book: GutenGuessBook): string {
  return `Japanese sumi-e ink wash style book cover for "${book.title}" by ${book.author}.
Minimalist zen aesthetic, monochromatic sepia/ink tones, traditional brushwork,
generous negative space. No text or letters. Evokes the book's essence through
symbolic imagery related to ${book.genre}. Square format, subtle paper texture.`;
}

async function generateCover(
  openai: OpenAI,
  book: GutenGuessBook,
): Promise<Buffer> {
  const result = await openai.images.generate({
    model: 'gpt-image-1.5',
    prompt: buildPrompt(book),
    size: '1024x1024',
    quality: 'high',
    n: 1,
  });

  const base64 = result.data[0].b64_json;
  if (!base64) {
    throw new Error('No image data returned from OpenAI');
  }

  return Buffer.from(base64, 'base64');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

interface ProcessResult {
  bookId: number;
  title: string;
  success: boolean;
  skipped: boolean;
  error?: string;
}

try {
  console.log(pc.bold('\n🎨 GutenGuess Cover Generator\n'));

  // Check for API key
  const apiSpinner = ora('Checking OpenAI API key...').start();
  if (!process.env.OPENAI_API_KEY) {
    apiSpinner.fail(pc.red('OPENAI_API_KEY not found in environment'));
    process.exit(1);
  }
  apiSpinner.succeed(pc.green('OpenAI API key found'));

  // Create covers directory if needed
  const dirSpinner = ora('Checking covers directory...').start();
  if (!fs.existsSync(COVERS_DIR)) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
    dirSpinner.succeed(pc.green(`Created directory: ${COVERS_DIR}`));
  } else {
    dirSpinner.succeed(pc.green('Covers directory exists'));
  }

  // Determine which books to process
  const allBooks = getGutenGuessBooks();
  const books = options.book
    ? allBooks.filter((b) => b.id === Number.parseInt(options.book!, 10))
    : [...allBooks];

  if (books.length === 0) {
    console.log(pc.red(`\n✗ Book with ID ${options.book} not found`));
    process.exit(1);
  }

  // Dry run mode
  if (options.dryRun) {
    console.log(pc.yellow('\n⚠️  DRY RUN - No API calls will be made.\n'));
    console.log(`Would process ${pc.cyan(String(books.length))} book(s):`);

    let wouldGenerate = 0;
    let wouldSkip = 0;

    for (const book of books) {
      const coverPath = path.join(COVERS_DIR, `${book.id}.webp`);
      const exists = fs.existsSync(coverPath);

      if (exists && !options.force) {
        console.log(pc.dim(`  ○ ${book.title} (exists, would skip)`));
        wouldSkip++;
      } else {
        console.log(pc.cyan(`  • ${book.title} by ${book.author}`));
        wouldGenerate++;
      }
    }

    console.log(
      `\nForce regenerate: ${options.force ? pc.red('yes') : pc.green('no')}`,
    );
    console.log(`\nWould generate: ${pc.cyan(String(wouldGenerate))}`);
    console.log(`Would skip: ${pc.dim(String(wouldSkip))}`);
    process.exit(0);
  }

  console.log(`\nProcessing ${pc.cyan(String(books.length))} book(s)...`);
  console.log(
    `Force regenerate: ${options.force ? pc.red('yes') : pc.green('no')}`,
  );
  console.log(`Output: ${pc.dim(COVERS_DIR)}\n`);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format: `Generating ${pc.cyan('{bar}')} ${pc.yellow('{percentage}%')} | {value}/{total} | {title}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  progressBar.start(books.length, 0, { title: pc.dim('Starting...') });

  const results: ProcessResult[] = [];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const coverPath = path.join(COVERS_DIR, `${book.id}.webp`);

    progressBar.update(i, { title: pc.dim(book.title) });

    // Skip if cover already exists (unless --force)
    if (fs.existsSync(coverPath) && !options.force) {
      results.push({
        bookId: book.id,
        title: book.title,
        success: true,
        skipped: true,
      });
      continue;
    }

    try {
      const imageBuffer = await generateCover(openai, book);

      // Convert to WebP and resize
      await sharp(imageBuffer)
        .resize(512, 512)
        .webp({ quality: 85 })
        .toFile(coverPath);

      results.push({
        bookId: book.id,
        title: book.title,
        success: true,
        skipped: false,
      });

      // Rate limiting - wait between API calls
      if (i < books.length - 1) {
        await sleep(2000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        bookId: book.id,
        title: book.title,
        success: false,
        skipped: false,
        error: message,
      });

      // Wait longer after errors
      await sleep(5000);
    }
  }

  progressBar.update(books.length, { title: pc.green('Complete') });
  progressBar.stop();

  // Print summary
  const generated = results.filter((r) => r.success && !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(pc.bold('\n═══ Generation Summary ═══\n'));
  console.log(pc.green(`✓ Generated: ${generated}`));
  console.log(pc.yellow(`⏩ Skipped:   ${skipped}`));
  console.log(pc.red(`✗ Failed:    ${failed}`));

  // Print details for failed books
  const failedResults = results.filter((r) => !r.success);
  if (failedResults.length > 0) {
    console.log(pc.red('\nFailed books:'));
    for (const r of failedResults) {
      console.log(pc.red(`  ✗ ${r.title}: ${r.error}`));
    }
  }

  console.log(pc.dim(`\nCovers saved to: ${COVERS_DIR}`));
  console.log(pc.bold(pc.green('\n✨ Done!\n')));
  process.exit(failed > 0 ? 1 : 0);
} catch (error) {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
}
