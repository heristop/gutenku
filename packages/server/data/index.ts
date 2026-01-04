/**
 * Book data wrapper with fallback logic.
 * Uses @gutenguess/server submodule if available, otherwise falls back to local fixture.
 */

// Try to import from submodule, fall back to local fixture if unavailable
// Use variable to prevent TypeScript from resolving the optional module at compile time
const gutenguessModule = '@gutenguess/server';
let source: typeof import('./gutenguess-books.js');

try {
  source = await import(/* @vite-ignore */ gutenguessModule);
} catch {
  source = await import('./gutenguess-books.js');
}

export const { getGutenGuessBooks, GUTENGUESS_BOOKS, GUTENGUESS_BOOK_COUNT } =
  source;
export type { GutenGuessBook } from './gutenguess-books.js';
