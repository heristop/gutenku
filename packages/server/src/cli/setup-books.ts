#!/usr/bin/env node
import 'reflect-metadata';
import { Command } from 'commander';
import dotenv from 'dotenv';
import { container } from 'tsyringe';
import path from 'node:path';
import pc from 'picocolors';
import ora from 'ora';
import cliProgress from 'cli-progress';
import { BOOK_IDS } from './book-ids';
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
  console.log(pc.green(`✓ Success:  ${result.successCount}`));
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

  console.log(pc.bold(pc.green('\n✨ Done!\n')));
  process.exit(0);
} catch (error) {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
}
