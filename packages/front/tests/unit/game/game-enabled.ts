import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// GutenGuess lives in a private submodule: its component tests run only where
// it is checked out, so public CI stays green without it. Vitest runs from
// packages/front.
export const gameEnabled = existsSync(
  resolve(process.cwd(), '../../private/gutenguess/packages/front'),
);
