import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DeleteBookHandler } from '../../src/application/commands/book/DeleteBookHandler';
import { DeleteBookCommand } from '../../src/application/commands/book/DeleteBookCommand';
import { FetchBookHandler } from '../../src/application/commands/book/FetchBookHandler';
import { FetchBookCommand } from '../../src/application/commands/book/FetchBookCommand';
import { SaveBookHandler } from '../../src/application/commands/book/SaveBookHandler';
import { SaveBookCommand } from '../../src/application/commands/book/SaveBookCommand';
import { ImportBookHandler } from '../../src/application/commands/book/ImportBookHandler';
import { ImportBookCommand } from '../../src/application/commands/book/ImportBookCommand';
import { BatchImportBooksHandler } from '../../src/application/commands/book/BatchImportBooksHandler';
import { BatchImportBooksCommand } from '../../src/application/commands/book/BatchImportBooksCommand';
import type { IBookRepository } from '../../src/domain/repositories/IBookRepository';
import type { IChapterRepository } from '../../src/domain/repositories/IChapterRepository';
import type { IGutenbergClient } from '../../src/domain/gateways/IGutenbergClient';
import type { IFileSystemService } from '../../src/domain/gateways/IFileSystemService';
import type { ICommandBus } from '../../src/application/cqrs/ICommandBus';
import type {
  BookParserService,
  ParsingResult,
} from '../../src/domain/services/BookParserService';

describe('Book Command Handlers', () => {
  describe('DeleteBookHandler', () => {
    let handler: DeleteBookHandler;
    let mockBookRepo: IBookRepository;

    beforeEach(() => {
      mockBookRepo = {
        getAllBooks: vi.fn(),
        getBookById: vi.fn(),
        selectRandomBook: vi.fn(),
        existsByReference: vi.fn(),
        findByReference: vi.fn(),
        create: vi.fn(),
        addChapter: vi.fn(),
        deleteByReference: vi.fn(),
      };
      handler = new DeleteBookHandler(mockBookRepo);
    });

    it('deletes book and returns result', async () => {
      vi.mocked(mockBookRepo.deleteByReference).mockResolvedValue({
        deleted: true,
        chaptersDeleted: 10,
      });

      const command = new DeleteBookCommand(12345);
      const result = await handler.execute(command);

      expect(result.bookId).toBe(12345);
      expect(result.deleted).toBeTruthy();
      expect(result.chaptersDeleted).toBe(10);
      expect(mockBookRepo.deleteByReference).toHaveBeenCalledWith(12345);
    });

    it('returns false if book does not exist', async () => {
      vi.mocked(mockBookRepo.deleteByReference).mockResolvedValue({
        deleted: false,
        chaptersDeleted: 0,
      });

      const command = new DeleteBookCommand(99999);
      const result = await handler.execute(command);

      expect(result.deleted).toBeFalsy();
      expect(result.chaptersDeleted).toBe(0);
    });
  });

  describe('FetchBookHandler', () => {
    let handler: FetchBookHandler;
    let mockGutenbergClient: IGutenbergClient;
    let mockFileSystem: IFileSystemService;

    beforeEach(() => {
      mockGutenbergClient = {
        fetchBook: vi.fn(),
        isAvailable: vi.fn(),
      };
      mockFileSystem = {
        ensureDirectory: vi.fn(),
        fileExists: vi.fn(),
        readFile: vi.fn(),
        writeFile: vi.fn(),
      };
      handler = new FetchBookHandler(mockGutenbergClient, mockFileSystem);
    });

    it('returns alreadyExists if file exists', async () => {
      vi.mocked(mockFileSystem.fileExists).mockResolvedValue(true);

      const command = new FetchBookCommand(12345, '/data');
      const result = await handler.execute(command);

      expect(result.success).toBeTruthy();
      expect(result.alreadyExists).toBeTruthy();
      expect(result.filePath).toBe('/data/book_12345.txt');
      expect(mockGutenbergClient.fetchBook).not.toHaveBeenCalled();
    });

    it('fetches book from Gutenberg and writes to file', async () => {
      vi.mocked(mockFileSystem.fileExists).mockResolvedValue(false);
      vi.mocked(mockGutenbergClient.fetchBook).mockResolvedValue(
        'Book content here',
      );
      vi.mocked(mockFileSystem.writeFile).mockResolvedValue();

      const command = new FetchBookCommand(12345, '/data');
      const result = await handler.execute(command);

      expect(result.success).toBeTruthy();
      expect(result.alreadyExists).toBeFalsy();
      expect(mockGutenbergClient.fetchBook).toHaveBeenCalledWith(12345);
      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        '/data/book_12345.txt',
        'Book content here',
      );
    });

    it('returns failure if fetch fails', async () => {
      vi.mocked(mockFileSystem.fileExists).mockResolvedValue(false);
      vi.mocked(mockGutenbergClient.fetchBook).mockRejectedValue(
        new Error('Network error'),
      );

      const command = new FetchBookCommand(12345, '/data');
      const result = await handler.execute(command);

      expect(result.success).toBeFalsy();
      expect(result.alreadyExists).toBeFalsy();
    });

    it('uses default data directory', () => {
      const command = new FetchBookCommand(12345);
      expect(command.dataDirectory).toBe('./data');
    });
  });

  describe('SaveBookHandler', () => {
    let handler: SaveBookHandler;
    let mockBookRepo: IBookRepository;
    let mockChapterRepo: IChapterRepository;
    let mockFileSystem: IFileSystemService;
    let mockBookParser: BookParserService;

    beforeEach(() => {
      mockBookRepo = {
        getAllBooks: vi.fn(),
        getBookById: vi.fn(),
        selectRandomBook: vi.fn(),
        existsByReference: vi.fn(),
        findByReference: vi.fn(),
        create: vi.fn(),
        addChapter: vi.fn(),
        deleteByReference: vi.fn(),
      };
      mockChapterRepo = {
        getAllChapters: vi.fn(),
        getChapterById: vi.fn(),
        getFilteredChapters: vi.fn(),
        createMany: vi.fn(),
        deleteByBookId: vi.fn(),
      };
      mockFileSystem = {
        ensureDirectory: vi.fn(),
        fileExists: vi.fn(),
        readFile: vi.fn(),
        writeFile: vi.fn(),
      };
      mockBookParser = {
        parse: vi.fn(),
        parseContent: vi.fn(),
      } as unknown as BookParserService;
      handler = new SaveBookHandler(
        mockBookRepo,
        mockChapterRepo,
        mockFileSystem,
        mockBookParser,
      );
    });

    it('returns alreadyExists if book exists in database', async () => {
      vi.mocked(mockBookRepo.existsByReference).mockResolvedValue(true);

      const command = new SaveBookCommand(12345, '/data');
      const result = await handler.execute(command);

      expect(result.success).toBeTruthy();
      expect(result.alreadyExists).toBeTruthy();
      expect(result.chaptersCount).toBe(0);
      expect(mockFileSystem.readFile).not.toHaveBeenCalled();
    });

    it('parses and saves new book with chapters', async () => {
      vi.mocked(mockBookRepo.existsByReference).mockResolvedValue(false);
      vi.mocked(mockFileSystem.readFile).mockResolvedValue('book content');
      vi.mocked(mockBookParser.parseContent).mockReturnValue({
        isValid: true,
        parsedBook: {
          title: 'Test Book',
          author: 'Test Author',
          chapters: [
            { title: 'Chapter 1', content: 'Content 1' },
            { title: 'Chapter 2', content: 'Content 2' },
          ],
        },
        errors: [],
        warnings: [],
        patternUsed: null,
        stats: {
          rawChapterCount: 2,
          validChapterCount: 2,
          rejectedChapterCount: 0,
        },
      } as ParsingResult);
      vi.mocked(mockBookRepo.create).mockResolvedValue('book-db-id');
      vi.mocked(mockChapterRepo.createMany).mockResolvedValue([
        'ch1-id',
        'ch2-id',
      ]);
      vi.mocked(mockBookRepo.addChapter).mockResolvedValue();

      const command = new SaveBookCommand(12345, '/data');
      const result = await handler.execute(command);

      expect(result.success).toBeTruthy();
      expect(result.alreadyExists).toBeFalsy();
      expect(result.chaptersCount).toBe(2);
      expect(result.title).toBe('Test Book');
      expect(mockBookRepo.create).toHaveBeenCalledWith({
        reference: 12345,
        title: 'Test Book',
        author: 'Test Author',
      });
      expect(mockChapterRepo.createMany).toHaveBeenCalled();
      expect(mockBookRepo.addChapter).toHaveBeenCalledTimes(2);
    });

    it('returns failure if file read fails', async () => {
      vi.mocked(mockBookRepo.existsByReference).mockResolvedValue(false);
      vi.mocked(mockFileSystem.readFile).mockRejectedValue(
        new Error('File not found'),
      );

      const command = new SaveBookCommand(12345, '/data');
      const result = await handler.execute(command);

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('File not found');
    });

    it('returns failure if book parsing fails', async () => {
      vi.mocked(mockBookRepo.existsByReference).mockResolvedValue(false);
      vi.mocked(mockFileSystem.readFile).mockResolvedValue('Invalid content');
      vi.mocked(mockBookParser.parseContent).mockReturnValue({
        isValid: false,
        parsedBook: null,
        errors: ['Failed to parse book'],
        warnings: [],
        patternUsed: null,
        stats: {
          rawChapterCount: 0,
          validChapterCount: 0,
          rejectedChapterCount: 0,
        },
      } as ParsingResult);

      const command = new SaveBookCommand(12345, '/data');
      const result = await handler.execute(command);

      expect(result.success).toBeFalsy();
      expect(result.error).toBeDefined();
    });

    it('uses default data directory', () => {
      const command = new SaveBookCommand(12345);
      expect(command.dataDirectory).toBe('./data');
    });
  });

  describe('ImportBookHandler', () => {
    let handler: ImportBookHandler;
    let mockCommandBus: ICommandBus;

    beforeEach(() => {
      mockCommandBus = {
        execute: vi.fn(),
      };
      handler = new ImportBookHandler(mockCommandBus);
    });

    it('fetches and saves book successfully', async () => {
      vi.mocked(mockCommandBus.execute)
        .mockResolvedValueOnce({
          // FetchBookCommand result
          bookId: 12345,
          filePath: '/data/book_12345.txt',
          success: true,
          alreadyExists: false,
        })
        .mockResolvedValueOnce({
          // SaveBookCommand result
          bookId: 12345,
          success: true,
          alreadyExists: false,
          chaptersCount: 5,
          title: 'Test Book',
        });

      const command = new ImportBookCommand(12345, false, '/data');
      const result = await handler.execute(command);

      expect(result.bookId).toBe(12345);
      expect(result.fetched).toBeTruthy();
      expect(result.saved).toBeTruthy();
      expect(result.deleted).toBeFalsy();
      expect(result.chaptersCount).toBe(5);
      expect(result.title).toBe('Test Book');
    });

    it('deletes before import when deleteFirst is true', async () => {
      vi.mocked(mockCommandBus.execute)
        .mockResolvedValueOnce({
          // DeleteBookCommand result
          bookId: 12345,
          deleted: true,
          chaptersDeleted: 3,
        })
        .mockResolvedValueOnce({
          // FetchBookCommand result
          bookId: 12345,
          filePath: '/data/book_12345.txt',
          success: true,
          alreadyExists: false,
        })
        .mockResolvedValueOnce({
          // SaveBookCommand result
          bookId: 12345,
          success: true,
          alreadyExists: false,
          chaptersCount: 5,
          title: 'Test Book',
        });

      const command = new ImportBookCommand(12345, true, '/data');
      const result = await handler.execute(command);

      expect(result.deleted).toBeTruthy();
      expect(result.fetched).toBeTruthy();
      expect(result.saved).toBeTruthy();
      expect(mockCommandBus.execute).toHaveBeenCalledTimes(3);
    });

    it('returns failure if fetch fails', async () => {
      vi.mocked(mockCommandBus.execute).mockResolvedValueOnce({
        // FetchBookCommand result - failure
        bookId: 12345,
        filePath: '/data/book_12345.txt',
        success: false,
        alreadyExists: false,
      });

      const command = new ImportBookCommand(12345, false, '/data');
      const result = await handler.execute(command);

      expect(result.fetched).toBeFalsy();
      expect(result.saved).toBeFalsy();
      expect(result.error).toBe('Failed to fetch book from Gutenberg');
      expect(mockCommandBus.execute).toHaveBeenCalledTimes(1);
    });

    it('handles save failure after successful fetch', async () => {
      vi.mocked(mockCommandBus.execute)
        .mockResolvedValueOnce({
          // FetchBookCommand result
          bookId: 12345,
          filePath: '/data/book_12345.txt',
          success: true,
          alreadyExists: false,
        })
        .mockResolvedValueOnce({
          // SaveBookCommand result - failure
          bookId: 12345,
          success: false,
          alreadyExists: false,
          chaptersCount: 0,
          error: 'Parse error',
        });

      const command = new ImportBookCommand(12345, false, '/data');
      const result = await handler.execute(command);

      expect(result.fetched).toBeTruthy();
      expect(result.saved).toBeFalsy();
      expect(result.error).toBe('Parse error');
    });

    it('uses default values for optional parameters', () => {
      const command = new ImportBookCommand(12345);
      expect(command.deleteFirst).toBeFalsy();
      expect(command.dataDirectory).toBe('./data');
    });
  });

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
        // no error property
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
      expect(progressCallback).toHaveBeenNthCalledWith(
        1,
        1001,
        1,
        2,
        'Book One',
      );
      expect(progressCallback).toHaveBeenNthCalledWith(
        2,
        1002,
        2,
        2,
        'Book Two',
      );
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
});

describe('Book Command Classes', () => {
  it('DeleteBookCommand stores bookId', () => {
    const command = new DeleteBookCommand(12345);
    expect(command.bookId).toBe(12345);
  });

  it('FetchBookCommand stores bookId and dataDirectory', () => {
    const command = new FetchBookCommand(12345, '/custom/path');
    expect(command.bookId).toBe(12345);
    expect(command.dataDirectory).toBe('/custom/path');
  });

  it('SaveBookCommand stores bookId and dataDirectory', () => {
    const command = new SaveBookCommand(12345, '/custom/path');
    expect(command.bookId).toBe(12345);
    expect(command.dataDirectory).toBe('/custom/path');
  });

  it('ImportBookCommand stores all parameters', () => {
    const command = new ImportBookCommand(12345, true, '/custom/path');
    expect(command.bookId).toBe(12345);
    expect(command.deleteFirst).toBeTruthy();
    expect(command.dataDirectory).toBe('/custom/path');
  });

  it('BatchImportBooksCommand stores all parameters', () => {
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

  it('BatchImportBooksCommand uses default values', () => {
    const command = new BatchImportBooksCommand([1001]);

    expect(command.bookIds).toEqual([1001]);
    expect(command.deleteFirst).toBeFalsy();
    expect(command.dataDirectory).toBe('./data');
    expect(command.onProgress).toBeUndefined();
  });
});
