import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BatchImportBooksHandler } from '../../src/application/commands/book/BatchImportBooksHandler';
import { BatchImportBooksCommand } from '../../src/application/commands/book/BatchImportBooksCommand';
import type { ICommandBus } from '../../src/application/cqrs/ICommandBus';

describe('BatchImportBooksHandler', () => {
  let handler: BatchImportBooksHandler;
  let mockCommandBus: ICommandBus;

  beforeEach(() => {
    mockCommandBus = {
      execute: vi.fn(),
    };
    handler = new BatchImportBooksHandler(mockCommandBus);
  });

  it('imports multiple books successfully', async () => {
    vi.mocked(mockCommandBus.execute)
      .mockResolvedValueOnce({
        bookId: 1001,
        fetched: true,
        saved: true,
        deleted: false,
        chaptersCount: 5,
        title: 'Book One',
      })
      .mockResolvedValueOnce({
        bookId: 1002,
        fetched: true,
        saved: true,
        deleted: false,
        chaptersCount: 8,
        title: 'Book Two',
      });

    const command = new BatchImportBooksCommand([1001, 1002], false, '/data');
    const result = await handler.execute(command);

    expect(result.totalBooks).toBe(2);
    expect(result.successCount).toBe(2);
    expect(result.failedCount).toBe(0);
    expect(result.skippedCount).toBe(0);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].title).toBe('Book One');
    expect(result.results[1].title).toBe('Book Two');
  });

  it('handles import failures gracefully', async () => {
    vi.mocked(mockCommandBus.execute)
      .mockResolvedValueOnce({
        bookId: 1001,
        fetched: true,
        saved: true,
        deleted: false,
        chaptersCount: 5,
        title: 'Book One',
      })
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        bookId: 1003,
        fetched: true,
        saved: true,
        deleted: false,
        chaptersCount: 3,
        title: 'Book Three',
      });

    const command = new BatchImportBooksCommand(
      [1001, 1002, 1003],
      false,
      '/data',
    );
    const result = await handler.execute(command);

    expect(result.totalBooks).toBe(3);
    expect(result.successCount).toBe(2);
    expect(result.failedCount).toBe(1);
    expect(result.results[1].success).toBeFalsy();
    expect(result.results[1].error).toBe('Network error');
  });

  it('handles save failures with error message', async () => {
    vi.mocked(mockCommandBus.execute).mockResolvedValueOnce({
      bookId: 1001,
      fetched: true,
      saved: false,
      deleted: false,
      chaptersCount: 0,
      error: 'Parse error',
    });

    const command = new BatchImportBooksCommand([1001], false, '/data');
    const result = await handler.execute(command);

    expect(result.successCount).toBe(0);
    expect(result.failedCount).toBe(1);
    expect(result.results[0].success).toBeFalsy();
    expect(result.results[0].error).toBe('Parse error');
  });

  it('handles skipped books (no error, not saved)', async () => {
    vi.mocked(mockCommandBus.execute).mockResolvedValueOnce({
      bookId: 1001,
      fetched: true,
      saved: false,
      deleted: false,
      chaptersCount: 0,
    });

    const command = new BatchImportBooksCommand([1001], false, '/data');
    const result = await handler.execute(command);

    expect(result.successCount).toBe(0);
    expect(result.failedCount).toBe(0);
    expect(result.skippedCount).toBe(1);
  });

  it('calls progress callback for each book', async () => {
    const progressCallback = vi.fn();
    vi.mocked(mockCommandBus.execute)
      .mockResolvedValueOnce({
        bookId: 1001,
        fetched: true,
        saved: true,
        deleted: false,
        chaptersCount: 5,
        title: 'Book One',
      })
      .mockResolvedValueOnce({
        bookId: 1002,
        fetched: true,
        saved: true,
        deleted: false,
        chaptersCount: 3,
        title: 'Book Two',
      });

    const command = new BatchImportBooksCommand(
      [1001, 1002],
      false,
      '/data',
      progressCallback,
    );
    await handler.execute(command);

    expect(progressCallback).toHaveBeenCalledTimes(2);
    expect(progressCallback).toHaveBeenNthCalledWith(1, 1001, 1, 2, 'Book One');
    expect(progressCallback).toHaveBeenNthCalledWith(2, 1002, 2, 2, 'Book Two');
  });

  it('passes deleteFirst to import command', async () => {
    vi.mocked(mockCommandBus.execute).mockResolvedValueOnce({
      bookId: 1001,
      fetched: true,
      saved: true,
      deleted: true,
      chaptersCount: 5,
      title: 'Book One',
    });

    const command = new BatchImportBooksCommand([1001], true, '/data');
    await handler.execute(command);

    expect(mockCommandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        bookId: 1001,
        deleteFirst: true,
        dataDirectory: '/data',
      }),
    );
  });

  it('handles empty book list', async () => {
    const command = new BatchImportBooksCommand([], false, '/data');
    const result = await handler.execute(command);

    expect(result.totalBooks).toBe(0);
    expect(result.successCount).toBe(0);
    expect(result.failedCount).toBe(0);
    expect(result.results).toHaveLength(0);
    expect(mockCommandBus.execute).not.toHaveBeenCalled();
  });

  it('handles unknown error type', async () => {
    vi.mocked(mockCommandBus.execute).mockRejectedValueOnce('String error');

    const command = new BatchImportBooksCommand([1001], false, '/data');
    const result = await handler.execute(command);

    expect(result.failedCount).toBe(1);
    expect(result.results[0].error).toBe('Unknown error');
  });

  it('continues processing after error', async () => {
    vi.mocked(mockCommandBus.execute)
      .mockRejectedValueOnce(new Error('First error'))
      .mockRejectedValueOnce(new Error('Second error'))
      .mockResolvedValueOnce({
        bookId: 1003,
        fetched: true,
        saved: true,
        deleted: false,
        chaptersCount: 5,
        title: 'Book Three',
      });

    const command = new BatchImportBooksCommand(
      [1001, 1002, 1003],
      false,
      '/data',
    );
    const result = await handler.execute(command);

    expect(mockCommandBus.execute).toHaveBeenCalledTimes(3);
    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(2);
  });

  it('uses default data directory', () => {
    const command = new BatchImportBooksCommand([1001, 1002]);
    expect(command.dataDirectory).toBe('./data');
    expect(command.deleteFirst).toBeFalsy();
  });
});

describe('BatchImportBooksCommand', () => {
  it('stores all parameters', () => {
    const progressCallback = vi.fn();
    const command = new BatchImportBooksCommand(
      [1001, 1002, 1003],
      true,
      '/custom/path',
      progressCallback,
    );

    expect(command.bookIds).toEqual([1001, 1002, 1003]);
    expect(command.deleteFirst).toBeTruthy();
    expect(command.dataDirectory).toBe('/custom/path');
    expect(command.onProgress).toBe(progressCallback);
  });

  it('uses default values', () => {
    const command = new BatchImportBooksCommand([1001]);

    expect(command.bookIds).toEqual([1001]);
    expect(command.deleteFirst).toBeFalsy();
    expect(command.dataDirectory).toBe('./data');
    expect(command.onProgress).toBeUndefined();
  });
});
