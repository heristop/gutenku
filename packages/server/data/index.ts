/**
 * Book data wrapper with fallback logic.
 * Uses @gutenguess/server submodule if available, otherwise falls back to local fixture.
 */
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Allow override via env for local development
const gutenguessServerPath = process.env.GUTENGUESS_PATH
  ? resolve(process.env.GUTENGUESS_PATH, 'packages/server')
  : resolve(__dirname, '../../private/gutenguess/packages/server');
const hasSubmodule = existsSync(gutenguessServerPath);

// Re-export from submodule or fallback
const source = hasSubmodule
  ? await import('@gutenguess/server')
  : await import('./gutenguess-books.js');

export const { getGutenGuessBooks, GUTENGUESS_BOOKS, GUTENGUESS_BOOK_COUNT } =
  source;
export type { GutenGuessBook } from './gutenguess-books.js';
