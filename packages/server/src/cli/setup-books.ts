#!/usr/bin/env node
import 'reflect-metadata';
import { Command } from 'commander';
import dotenv from 'dotenv';
import { container } from 'tsyringe';
import path from 'node:path';
import pc from 'picocolors';
import ora from 'ora';
import cliProgress from 'cli-progress';
import { BOOK_IDS } from '../shared/constants/book-ids';
import MongoConnection from '~/infrastructure/services/MongoConnection';
import '~/infrastructure/di/container';
import {
  type ICommandBus,
  ICommandBusToken,
} from '~/application/cqrs/ICommandBus';
import { BatchImportBooksCommand } from '~/application/commands/book';

dotenv.config();

const program = new Command();

program
  .name('setup-books')
  .description('Fetch and import books from Project Gutenberg')
  .version('1.0.0')
  .option('-r, --reset', 'Reset database before importing', false)
  .option('--data-dir <path>', 'Directory to cache downloaded books', './data')
  .option('--book <id>', 'Import a single book by ID')
  .option('--dry-run', 'Show what would be imported without making changes')
  .parse(process.argv);

const options = program.opts<{
  reset: boolean;
  dataDir: string;
  book?: string;
  dryRun?: boolean;
}>();

try {
  console.log(pc.bold('\n📚 Gutenku Book Import\n'));

  // Connect to MongoDB with spinner
  const dbSpinner = ora('Connecting to MongoDB...').start();
  const mongoConnection = container.resolve(MongoConnection);
  const db = await mongoConnection.connect();

  if (!db) {
    dbSpinner.fail(pc.red('Failed to connect to MongoDB'));
    process.exit(1);
  }

  dbSpinner.succeed(pc.green('Connected to MongoDB'));

  // Determine which books to import
  const bookIds = options.book
    ? [Number.parseInt(options.book, 10)]
    : [...BOOK_IDS];

  if (options.dryRun) {
    console.log(pc.yellow('\n⚠️  DRY RUN - No changes will be made.\n'));
    console.log(`Would import ${pc.cyan(String(bookIds.length))} book(s):`);
    bookIds.forEach((id) => console.log(pc.dim(`  • Book ${id}`)));
    console.log(
      `\nReset first: ${options.reset ? pc.red('yes') : pc.green('no')}`,
    );
    console.log(`Data directory: ${pc.dim(path.resolve(options.dataDir))}`);
    process.exit(0);
  }

  console.log(`\nImporting ${pc.cyan(String(bookIds.length))} book(s)...`);
  console.log(`Reset first: ${options.reset ? pc.red('yes') : pc.green('no')}`);
  console.log(`Data directory: ${pc.dim(path.resolve(options.dataDir))}\n`);

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format: `Importing ${pc.cyan('{bar}')} ${pc.yellow('{percentage}%')} | {value}/{total} | {title}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  progressBar.start(bookIds.length, 0, { title: pc.dim('Starting...') });

  // Execute batch import with progress callback
  const commandBus = container.resolve<ICommandBus>(ICommandBusToken);
  const command = new BatchImportBooksCommand(
    bookIds,
    options.reset,
    options.dataDir,
    (bookId, index, _total, title) => {
      const displayTitle = title || `Book ${bookId}`;
      progressBar.update(index, { title: pc.dim(displayTitle) });
    },
  );

  const result = await commandBus.execute(command);

  progressBar.update(bookIds.length, { title: pc.green('Complete') });
  progressBar.stop();

  // Print summary
  console.log(pc.bold('\n═══ Import Summary ═══\n'));
  console.log(pc.green(`✓ Success:  ${result.newCount}`));
  console.log(pc.red(`✗ Failed:   ${result.failedCount}`));
  console.log(pc.yellow(`⏩ Skipped:  ${result.skippedCount}`));

  // Print details for failed books
  const failed = result.results.filter((r) => !r.success && r.error);
  if (failed.length > 0) {
    console.log(pc.red('\nFailed books:'));
    failed.forEach((r) => {
      console.log(pc.red(`  ✗ Book ${r.bookId}: ${r.error}`));
    });
  }

  // Print details for successful books (summarized)
  const successful = result.results.filter((r) => r.success);
  if (successful.length > 0) {
    const totalChapters = successful.reduce(
      (sum, r) => sum + r.chaptersCount,
      0,
    );
    console.log(
      pc.green(
        `\n✓ Imported ${successful.length} books with ${totalChapters} total chapters`,
      ),
    );
  }

  // Print recap table
  console.log(pc.bold('\n═══ Books Recap ═══\n'));

  // Calculate column widths
  const idWidth = 6;
  const chaptersWidth = 10;
  const sourceWidth = 6;
  const statusWidth = 8;
  const titleWidth = 45;

  // Table header
  const headerLine = `${'ID'.padEnd(idWidth)} | ${'Title'.padEnd(titleWidth)} | ${'Chap.'.padEnd(chaptersWidth)} | ${'Source'.padEnd(sourceWidth)} | ${'Status'.padEnd(statusWidth)}`;
  const separatorLine = '-'.repeat(headerLine.length);

  console.log(pc.bold(headerLine));
  console.log(separatorLine);

  // Sort results by book ID for consistent display
  const sortedResults = [...result.results].sort((a, b) => a.bookId - b.bookId);

  for (const r of sortedResults) {
    const id = String(r.bookId).padEnd(idWidth);
    const title = (r.title || 'Unknown')
      .substring(0, titleWidth)
      .padEnd(titleWidth);
    const chapters = String(r.chaptersCount).padEnd(chaptersWidth);
    const source = (
      r.source === 'db' ? pc.yellow('db') : pc.cyan('new')
    ).padEnd(sourceWidth + 10); // +10 for color codes
    const status = r.success
      ? pc.green('✓'.padEnd(statusWidth))
      : pc.red('✗'.padEnd(statusWidth));

    console.log(`${id} | ${title} | ${chapters} | ${source} | ${status}`);
  }

  console.log(separatorLine);
  console.log(
    pc.bold(
      `${'Total'.padEnd(idWidth)} | ${' '.padEnd(titleWidth)} | ${String(result.results.reduce((sum, r) => sum + r.chaptersCount, 0)).padEnd(chaptersWidth)} | ${' '.padEnd(sourceWidth)} | ${successful.length}/${result.results.length}`,
    ),
  );

  console.log(pc.bold(pc.green('\n✨ Done!\n')));
  process.exit(0);
} catch (error) {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
}
