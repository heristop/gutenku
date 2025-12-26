import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import BookService from '../src/application/services/BookService';
import ChapterService from '../src/application/services/ChapterService';
import { PubSubService } from '../src/infrastructure/services/PubSubService';
import BookRepository from '../src/infrastructure/repositories/BookRepository';
import ChapterRepository from '../src/infrastructure/repositories/ChapterRepository';

describe('Application services', () => {
  describe('BookService', () => {
    it('forwards getAllBooks to repository', async () => {
      class StubBookRepository extends BookRepository {
        getAllBooks = vi.fn(async (_filter: string | null) => ['b1']);
        getBookById = vi.fn(async (_id: string) => ({ id: '1' }));
        selectRandomBook = vi.fn(async () => ({ id: 'r1' }) as unknown);
      }
      const repo = new StubBookRepository();
      const svc = new BookService(repo);
      expect(await svc.getAllBooks(null)).toEqual(['b1']);
      expect(repo.getAllBooks).toHaveBeenCalledWith(null);
    });

    it('forwards getBookById to repository', async () => {
      class StubBookRepository extends BookRepository {
        getAllBooks = vi.fn(async () => []);
        getBookById = vi.fn(async (_id: string) => ({ id: '1' }));
        selectRandomBook = vi.fn(async () => ({ id: 'r1' }) as unknown);
      }
      const repo = new StubBookRepository();
      const svc = new BookService(repo);
      expect(await svc.getBookById('1')).toEqual({ id: '1' });
      expect(repo.getBookById).toHaveBeenCalledWith('1');
    });

    it('forwards selectRandomBook to repository', async () => {
      class StubBookRepository extends BookRepository {
        getAllBooks = vi.fn(async () => []);
        getBookById = vi.fn(async () => null);
        selectRandomBook = vi.fn(async () => ({ id: 'r1' }) as unknown);
      }
      const repo = new StubBookRepository();
      const svc = new BookService(repo);
      expect(await svc.selectRandomBook()).toEqual({ id: 'r1' });
      expect(repo.selectRandomBook).toHaveBeenCalled();
    });

    it('passes filter to getAllBooks', async () => {
      class StubBookRepository extends BookRepository {
        getAllBooks = vi.fn(async (filter: string | null) =>
          filter ? ['filtered'] : ['all'],
        );
        getBookById = vi.fn(async () => null);
        selectRandomBook = vi.fn(async () => null);
      }
      const repo = new StubBookRepository();
      const svc = new BookService(repo);
      expect(await svc.getAllBooks('whale')).toEqual(['filtered']);
      expect(repo.getAllBooks).toHaveBeenCalledWith('whale');
    });

    it('handles null result from getBookById', async () => {
      class StubBookRepository extends BookRepository {
        getAllBooks = vi.fn(async () => []);
        getBookById = vi.fn(async () => null);
        selectRandomBook = vi.fn(async () => null);
      }
      const repo = new StubBookRepository();
      const svc = new BookService(repo);
      expect(await svc.getBookById('nonexistent')).toBeNull();
    });

    it('handles empty array from getAllBooks', async () => {
      class StubBookRepository extends BookRepository {
        getAllBooks = vi.fn(async () => []);
        getBookById = vi.fn(async () => null);
        selectRandomBook = vi.fn(async () => null);
      }
      const repo = new StubBookRepository();
      const svc = new BookService(repo);
      expect(await svc.getAllBooks(null)).toEqual([]);
    });
  });

  describe('ChapterService', () => {
    it('forwards getAllChapters to repository', async () => {
      class StubChapterRepository extends ChapterRepository {
        getAllChapters = vi.fn(async (_filter: string | null) => ['c1']);
        getChapterById = vi.fn(async (_id: string) => ({ id: 'c1' }));
      }
      const repo = new StubChapterRepository();
      const svc = new ChapterService(repo);
      expect(await svc.getAllChapters(null)).toEqual(['c1']);
      expect(repo.getAllChapters).toHaveBeenCalledWith(null);
    });

    it('forwards getChapterById to repository', async () => {
      class StubChapterRepository extends ChapterRepository {
        getAllChapters = vi.fn(async () => []);
        getChapterById = vi.fn(async (_id: string) => ({ id: 'c1' }));
      }
      const repo = new StubChapterRepository();
      const svc = new ChapterService(repo);
      expect(await svc.getChapterById('c1')).toEqual({ id: 'c1' });
      expect(repo.getChapterById).toHaveBeenCalledWith('c1');
    });

    it('passes filter to getAllChapters', async () => {
      class StubChapterRepository extends ChapterRepository {
        getAllChapters = vi.fn(async (filter: string | null) =>
          filter ? ['filtered-chapter'] : ['all-chapters'],
        );
        getChapterById = vi.fn(async () => null);
      }
      const repo = new StubChapterRepository();
      const svc = new ChapterService(repo);
      expect(await svc.getAllChapters('ocean')).toEqual(['filtered-chapter']);
      expect(repo.getAllChapters).toHaveBeenCalledWith('ocean');
    });

    it('handles null result from getChapterById', async () => {
      class StubChapterRepository extends ChapterRepository {
        getAllChapters = vi.fn(async () => []);
        getChapterById = vi.fn(async () => null);
      }
      const repo = new StubChapterRepository();
      const svc = new ChapterService(repo);
      expect(await svc.getChapterById('nonexistent')).toBeNull();
    });

    it('handles empty array from getAllChapters', async () => {
      class StubChapterRepository extends ChapterRepository {
        getAllChapters = vi.fn(async () => []);
        getChapterById = vi.fn(async () => null);
      }
      const repo = new StubChapterRepository();
      const svc = new ChapterService(repo);
      expect(await svc.getAllChapters(null)).toEqual([]);
    });
  });

  describe('PubSubService', () => {
    it('exposes an async iterator', () => {
      const svc = new PubSubService();
      const iter = svc.iterator(['TEST_EVENT']);
      const sym = (iter as AsyncIterableIterator<unknown>)[
        Symbol.asyncIterator
      ];
      expect(typeof sym).toBe('function');
    });

    it('handles multiple event triggers', () => {
      const svc = new PubSubService();
      const iter = svc.iterator(['EVENT_A', 'EVENT_B']);
      expect(iter).toBeDefined();
    });

    it('handles single event trigger', () => {
      const svc = new PubSubService();
      const iter = svc.iterator(['SINGLE_EVENT']);
      expect(iter).toBeDefined();
    });

    it('instance returns PubSub object', () => {
      const svc = new PubSubService();
      expect(svc.instance).toBeDefined();
      // PubSub may expose asyncIterableIterator or asyncIterator depending on version
      const hasIterMethod =
        typeof (svc.instance as unknown as Record<string, unknown>)
          .asyncIterableIterator === 'function' ||
        typeof (svc.instance as unknown as Record<string, unknown>)
          .asyncIterator === 'function';
      expect(hasIterMethod).toBeTruthy();
    });
  });
});
