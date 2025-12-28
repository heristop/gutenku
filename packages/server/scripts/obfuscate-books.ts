#!/usr/bin/env node
/**
 * Obfuscates book data to prevent casual GitHub browsing.
 * Generates gutenguess-books-encoded.ts from plain text source.
 */
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import ora from 'ora';
import { program } from 'commander';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_KEY = 'gutenku-puzzle-key';

function getKey(): string {
  return process.env.BOOKS_OBFUSCATION_KEY || DEFAULT_KEY;
}

function obfuscate(text: string): string {
  const key = getKey();
  const xored = [...text]
    .map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)),
    )
    .join('');
  return Buffer.from(xored, 'utf8').toString('base64');
}

function deobfuscate(encoded: string): string {
  const key = getKey();
  const xored = Buffer.from(encoded, 'base64').toString('utf8');
  return [...xored]
    .map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)),
    )
    .join('');
}

interface GutenGuessBook {
  id: number;
  title: string;
  author: string;
  genre: string;
  era: string;
  authorNationality: string;
  emoticons: string;
  notableQuotes: string[];
}

program
  .name('obfuscate-books')
  .description('Obfuscate book data for open-source distribution')
  .version('1.0.0')
  .option('--decode', 'Decode the current obfuscated file back to plain text')
  .option('--verify', 'Verify that encode/decode roundtrip works');

program.parse();

const options = program.opts();

async function main(): Promise<void> {
  const spinner = ora();
  const key = getKey();

  console.log(pc.cyan('\n  GutenGuess Book Obfuscator\n'));
  console.log(
    pc.dim(
      `  Key: ${key === DEFAULT_KEY ? 'default (set BOOKS_OBFUSCATION_KEY for custom)' : 'custom'}\n`,
    ),
  );

  if (options.verify) {
    spinner.start('Verifying encode/decode roundtrip...');
    const testString = "Alice's Adventures in Wonderland";
    const encoded = obfuscate(testString);
    const decoded = deobfuscate(encoded);

    if (decoded === testString) {
      spinner.succeed(pc.green('Roundtrip verification passed!'));
      console.log(pc.dim(`  Original:  ${testString}`));
      console.log(pc.dim(`  Encoded:   ${encoded}`));
      console.log(pc.dim(`  Decoded:   ${decoded}`));
    } else {
      spinner.fail(pc.red('Roundtrip verification failed!'));
      console.log(pc.red(`  Original: ${testString}`));
      console.log(pc.red(`  Decoded:  ${decoded}`));
      process.exit(1);
    }
    return;
  }

  const sourcePath = path.resolve(
    __dirname,
    '../src/cli/gutenguess-books-source.ts',
  );
  const outputPath = path.resolve(__dirname, '../src/cli/gutenguess-books.ts');

  if (options.decode) {
    spinner.start('Decoding obfuscated books...');

    // Dynamic import the encoded file
    const encodedModule = await import(outputPath);
    const encodedBooks = encodedModule.GUTENGUESS_BOOKS_ENCODED;

    const decodedBooks: GutenGuessBook[] = encodedBooks.map(
      (book: GutenGuessBook) => ({
        ...book,
        title: deobfuscate(book.title),
        author: deobfuscate(book.author),
        notableQuotes: book.notableQuotes.map(deobfuscate),
      }),
    );

    spinner.succeed(pc.green(`Decoded ${decodedBooks.length} books`));

    // Pretty print first 3 books
    console.log(pc.cyan('\n  Sample decoded books:\n'));
    decodedBooks.slice(0, 3).forEach((book) => {
      console.log(pc.white(`  ${book.id}: ${book.title} by ${book.author}`));
    });

    return;
  }

  // Encode mode
  spinner.start('Reading source file...');

  try {
    await fs.access(sourcePath);
  } catch {
    spinner.fail(pc.red('Source file not found!'));
    console.log(pc.yellow(`\n  Expected: ${sourcePath}`));
    console.log(
      pc.dim(
        '  Create gutenguess-books-source.ts with plain text books first.\n',
      ),
    );
    process.exit(1);
  }

  const sourceModule = await import(sourcePath);
  const sourceBooks: GutenGuessBook[] = sourceModule.GUTENGUESS_BOOKS_SOURCE;

  spinner.succeed(`Found ${sourceBooks.length} books to encode`);
  spinner.start('Obfuscating sensitive fields...');

  const encodedBooks = sourceBooks.map((book) => ({
    id: book.id,
    title: obfuscate(book.title),
    author: obfuscate(book.author),
    genre: book.genre,
    era: book.era,
    authorNationality: book.authorNationality,
    emoticons: book.emoticons,
    notableQuotes: book.notableQuotes.map(obfuscate),
  }));

  spinner.succeed(pc.green('Obfuscation complete'));
  spinner.start('Generating output file...');

  const outputContent = `/* eslint-disable max-lines -- Data file containing curated book list */
/**
 * OBFUSCATED book data for GutenGuess game.
 * DO NOT EDIT DIRECTLY - regenerate from gutenguess-books-source.ts
 *
 * To update books:
 * 1. Edit gutenguess-books-source.ts (gitignored)
 * 2. Run: pnpm obfuscate:books
 */
import { deobfuscate } from '../utils/obfuscate';

export interface GutenGuessBook {
  id: number;
  title: string;
  author: string;
  genre: string;
  era: string;
  authorNationality: string;
  emoticons: string;
  notableQuotes: string[];
}

interface EncodedGutenGuessBook {
  id: number;
  title: string;
  author: string;
  genre: string;
  era: string;
  authorNationality: string;
  emoticons: string;
  notableQuotes: string[];
}

const GUTENGUESS_BOOKS_ENCODED: readonly EncodedGutenGuessBook[] = ${JSON.stringify(
    encodedBooks,
    null,
    2,
  )
    .replaceAll(/"([^"]+)":/g, '$1:')
    .replaceAll(/"/g, "'")} as const;

let _decodedBooks: GutenGuessBook[] | null = null;

/**
 * Get decoded books. Lazily decodes on first access.
 */
export function getGutenGuessBooks(): readonly GutenGuessBook[] {
  if (!_decodedBooks) {
    _decodedBooks = GUTENGUESS_BOOKS_ENCODED.map((book) => ({
      ...book,
      title: deobfuscate(book.title),
      author: deobfuscate(book.author),
      notableQuotes: book.notableQuotes.map(deobfuscate),
    }));
  }
  return _decodedBooks;
}

export const GUTENGUESS_BOOK_COUNT = GUTENGUESS_BOOKS_ENCODED.length;
`;

  await fs.writeFile(outputPath, outputContent, 'utf8');
  spinner.succeed(pc.green(`Generated ${outputPath}`));

  // Show sample
  console.log(pc.cyan('\n  Sample encoded books:\n'));
  encodedBooks.slice(0, 2).forEach((book) => {
    console.log(pc.white(`  ${book.id}:`));
    console.log(pc.dim(`    title:  ${book.title.slice(0, 40)}...`));
    console.log(pc.dim(`    author: ${book.author}`));
    console.log(pc.dim(`    genre:  ${book.genre}`));
  });

  console.log(pc.green('\n  Done! The obfuscated file is ready for commit.\n'));
}

main().catch((err) => {
  console.error(pc.red('Error:'), err.message);
  process.exit(1);
});
