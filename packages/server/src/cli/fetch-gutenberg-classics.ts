#!/usr/bin/env npx tsx
/**
 * Crawl Project Gutenberg for classical books and top downloads.
 * Validates chapter extraction by default.
 *
 * Usage:
 *   pnpm fetch:classics                    # Discover + validate
 *   pnpm fetch:classics --limit 20         # Validate first 20 books
 *   pnpm fetch:classics --skip-validation  # Discovery only
 */

import 'reflect-metadata';
import { Command } from 'commander';
import pc from 'picocolors';
import { BOOK_IDS } from '~/shared/constants/book-ids';
import {
  displayValidatedBookIds,
  displayValidationResult,
  outputBookIds,
} from './fetch-gutenberg-classics-display';
import {
  MIN_VALID_CHAPTERS,
  fetchClassicsSection,
  fetchTopBooksSection,
  runValidation,
} from './fetch-gutenberg-classics-validation';
import type { GutenbergBook } from './fetch-gutenberg-classics-parsers';

// CLI options
const program = new Command();
program
  .name('fetch-gutenberg-classics')
  .description(
    'Crawl Project Gutenberg for classical books and validate chapter extraction',
  )
  .option('--skip-validation', 'Skip chapter extraction validation')
  .option('--limit <n>', 'Limit validation to first N books')
  .parse();

const options = program.opts<{
  skipValidation?: boolean;
  limit?: string;
}>();

function printDiscoverySummary(
  topBooks: GutenbergBook[],
  classics: Awaited<ReturnType<typeof fetchClassicsSection>>,
): void {
  console.log(pc.bold('\n═══ Discovery Summary ═══\n'));
  console.log(
    `${pc.dim('Classics found:')}   ${pc.cyan(String(classics.totalFound))} books`,
  );
  console.log(
    `${pc.dim('Non-English:')}      ${pc.yellow(String(classics.nonEnglishFiltered))} filtered`,
  );
  console.log(
    `${pc.dim('Duplicates:')}       ${pc.yellow(String(classics.duplicateCount))} removed`,
  );
  console.log(
    `${pc.dim('Top downloads:')}    ${pc.cyan(String(topBooks.length))} new`,
  );
  console.log(
    `${pc.dim('Classics unique:')} ${pc.green(String(classics.unique.length))} works`,
  );
}

async function main() {
  console.log(pc.bold('\n🏛️  Project Gutenberg Book Crawler\n'));

  const skipValidation = options.skipValidation ?? false;
  const limit = options.limit ? Number.parseInt(options.limit, 10) : undefined;
  const existingIds = new Set(BOOK_IDS);

  console.log(
    `${pc.dim('Collection:')}    ${pc.cyan(String(existingIds.size))} books already in your library`,
  );
  console.log(
    `${pc.dim('Validation:')}    ${skipValidation ? pc.yellow('skipped') : pc.green('enabled')}`,
  );

  if (limit) {
    console.log(`${pc.dim('Limit:')}         ${pc.cyan(String(limit))} books`);
  }
  console.log();

  // Fetch top downloads and classics
  const topBooks = await fetchTopBooksSection(existingIds);
  const classics = await fetchClassicsSection(existingIds);

  printDiscoverySummary(topBooks, classics);

  if (skipValidation) {
    outputBookIds('Top Downloads', topBooks);
    outputBookIds('Classical Books', classics.unique);
    console.log(pc.bold(pc.green('\n✨ Done!\n')));

    return;
  }

  // Prepare books for validation
  const allBooksToValidate = [...topBooks, ...classics.unique];
  const booksToValidate = limit
    ? allBooksToValidate.slice(0, limit)
    : allBooksToValidate;

  if (booksToValidate.length === 0) {
    console.log(pc.yellow('\n⚠️  No books to validate'));
    console.log(pc.bold(pc.green('\n✨ Done!\n')));

    return;
  }

  console.log(pc.bold('\n═══ Validating Chapter Extraction ═══\n'));
  console.log(
    `${pc.dim('Books to validate:')} ${pc.cyan(String(booksToValidate.length))}`,
  );
  console.log(
    `${pc.dim('Min chapters:')}      ${pc.cyan(String(MIN_VALID_CHAPTERS))}\n`,
  );

  const validationResults = await runValidation(booksToValidate);

  // Display results
  const passed = validationResults.filter((r) => r.success);
  const failed = validationResults.filter((r) => !r.success);

  console.log(pc.bold('\n═══ Validation Results ═══\n'));
  console.log(`${pc.green('✓ Passed:')} ${passed.length}`);
  console.log(`${pc.red('✗ Failed:')} ${failed.length}`);

  console.log(pc.bold('\n═══ All Validated Books ═══\n'));
  const allResults = [...validationResults].sort((a, b) => a.id - b.id);

  for (const r of allResults) {
    displayValidationResult(r);
  }

  displayValidatedBookIds(passed);
  console.log(pc.bold(pc.green('\n✨ Done!\n')));
}

main().catch((error) => {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
});
