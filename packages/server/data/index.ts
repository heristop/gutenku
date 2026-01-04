/**
 * Book data wrapper with fallback logic.
 * Uses @gutenguess/server submodule if available, otherwise falls back to local fixture.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Allow override via env for local development, defaults to current working directory
const gutenguessServerPath = process.env.GUTENGUESS_PATH
  ? resolve(process.env.GUTENGUESS_PATH, 'packages/server')
  : resolve(process.cwd(), 'packages/server');
const hasSubmodule = existsSync(gutenguessServerPath);

// Re-export from submodule or fallback
// Use variable to prevent TypeScript from resolving the optional module at compile time
const gutenguessModule = '@gutenguess/server';
const source = hasSubmodule
  ? await import(/* @vite-ignore */ gutenguessModule)
  : await import('./gutenguess-books.js');

export const { getGutenGuessBooks, GUTENGUESS_BOOKS, GUTENGUESS_BOOK_COUNT } =
  source;
export type { GutenGuessBook } from './gutenguess-books.js';
