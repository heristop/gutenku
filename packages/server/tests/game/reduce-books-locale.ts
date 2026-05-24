import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { ReduceBooksHandler } from '../../src/application/queries/puzzle/ReduceBooksHandler';
import { ReduceBooksQuery } from '../../src/application/queries/puzzle/ReduceBooksQuery';

describe('ReduceBooksHandler locale handling', () => {
  const handler = new ReduceBooksHandler();

  it('accepts the fr locale', async () => {
    const result = await handler.execute(
      new ReduceBooksQuery('2026-01-15', 'fr'),
    );
    expect(result.length).toBeGreaterThan(0);
    
for (const b of result) {
      expect(typeof b.title).toBe('string');
      expect(b.title.length).toBeGreaterThan(0);
    }
  });

  it('accepts the ja locale', async () => {
    const result = await handler.execute(
      new ReduceBooksQuery('2026-01-15', 'ja'),
    );
    expect(result.length).toBeGreaterThan(0);
  });

  it('falls back to en for an unsupported locale', async () => {
    const result = await handler.execute(
      new ReduceBooksQuery('2026-01-15', 'xx'),
    );
    expect(result.length).toBeGreaterThan(0);
  });
});
