/**
 * Display helpers for fetch-gutenberg-classics CLI:
 * validation result rendering, ID tables, and book ID output.
 */
import pc from 'picocolors';
import type { GutenbergBook } from './fetch-gutenberg-classics-parsers';
import type { ValidationResult } from './fetch-gutenberg-classics-validation';

// Helper to display a single validation result
export function displayValidationResult(r: ValidationResult): void {
  const status = r.success ? pc.green('✓') : pc.red('✗');
  const idStr = r.success
    ? pc.yellow(r.id.toString().padStart(6))
    : pc.dim(r.id.toString().padStart(6));
  const title = r.title.length > 45 ? r.title.slice(0, 42) + '...' : r.title;
  const titleStr = r.success ? pc.cyan(title) : pc.dim(title);

  if (!r.success) {
    const reason = r.error || `${r.validChapters}/${r.totalChapters} chapters`;
    console.log(`  ${status} ${idStr}  ${titleStr} ${pc.red(`(${reason})`)}`);

    return;
  }

  console.log(`  ${status} ${idStr}  ${titleStr}`);
  console.log(
    `           ${pc.dim(`${r.validChapters} chapters via ${r.patternUsed || 'none'}`)}`,
  );
}

// Helper to display validated book IDs table
export function displayValidatedBookIds(passed: ValidationResult[]): void {
  if (passed.length === 0) {
    return;
  }

  console.log(pc.bold('\n═══ Validated Book IDs for book-ids.ts ═══\n'));

  const idCol = 'ID'.padStart(6);
  const titleCol = 'Title'.padEnd(45);
  const chapCol = 'Ch'.padStart(3);
  const patternCol = 'Pattern';
  console.log(pc.dim(`  ${idCol}  ${titleCol}  ${chapCol}  ${patternCol}`));
  console.log(
    pc.dim(
      `  ${'─'.repeat(6)}  ${'─'.repeat(45)}  ${'─'.repeat(3)}  ${'─'.repeat(20)}`,
    ),
  );

  const sortedPassed = [...passed].sort((a, b) => a.id - b.id);

  for (const r of sortedPassed) {
    const id = pc.yellow(r.id.toString().padStart(6));
    const title =
      r.title.length > 45 ? r.title.slice(0, 42) + '...' : r.title.padEnd(45);
    const chapters = pc.green(r.validChapters.toString().padStart(3));
    const pattern = pc.dim(r.patternUsed || 'none');
    console.log(`  ${id}  ${pc.cyan(title)}  ${chapters}  ${pattern}`);
  }

  console.log(pc.dim('\n// Copy-paste IDs:'));
  const passedIds = sortedPassed.map((r) => r.id);

  for (let i = 0; i < passedIds.length; i += 10) {
    const chunk = passedIds.slice(i, i + 10);
    console.log(pc.yellow(chunk.join(', ') + ','));
  }
}

export function outputBookIds(label: string, books: GutenbergBook[]): void {
  if (books.length === 0) {
    return;
  }

  console.log(pc.bold(`\n═══ ${label} IDs for book-ids.ts ═══\n`));
  console.log(pc.dim('// Books discovered (not validated):'));

  const ids = books.map((b) => b.id).sort((a, b) => a - b);

  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    console.log(pc.yellow(chunk.join(', ') + ','));
  }
}
