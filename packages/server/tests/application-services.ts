import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import BookService from '../src/application/services/BookService';
import ChapterService from '../src/application/services/ChapterService';
import { PubSubService } from '../src/infrastructure/services/PubSubService';
import type { IQueryBus } from '../src/application/cqrs';
import {
  GetAllBooksQuery,
  GetBookByIdQuery,
  SelectRandomBookQuery,
} from '../src/application/queries/books';
import {
  GetAllChaptersQuery,
  GetChapterByIdQuery,
} from '../src/application/queries/chapters';

describe('Application services', () => {
  describe('BookService', () => {
    it('forwards getAllBooks to QueryBus', async () => {
      const mockQueryBus: IQueryBus = {
        execute: vi.fn(async () => ['b1']),
      };
      const svc = new BookService(mockQueryBus);
      expect(await svc.getAllBooks(null)).toEqual(['b1']);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetAllBooksQuery),
      );
    });

    it('forwards getBookById to QueryBus', async () => {
      const mockQueryBus: IQueryBus = {
        execute: vi.fn(async () => ({ id: '1' })),
      };
      const svc = new BookService(mockQueryBus);
      expect(await svc.getBookById('1')).toEqual({ id: '1' });
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetBookByIdQuery),
      );
    });

    it('forwards selectRandomBook to QueryBus', async () => {
      const mockQueryBus: IQueryBus = {
        execute: vi.fn(async () => ({ id: 'r1' })),
      };
      const svc = new BookService(mockQueryBus);
      expect(await svc.selectRandomBook()).toEqual({ id: 'r1' });
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(SelectRandomBookQuery),
      );
    });

    it('passes filter to getAllBooks', async () => {
      const mockQueryBus: IQueryBus = {
        execute: vi.fn(async (query) => {
          if (query instanceof GetAllBooksQuery && query.filter) {
            return ['filtered'];
          }
          return ['all'];
        }),
      };
      const svc = new BookService(mockQueryBus);
      expect(await svc.getAllBooks('whale')).toEqual(['filtered']);
    });

    it('handles null result from getBookById', async () => {
      const mockQueryBus: IQueryBus = {
        execute: vi.fn(async () => null),
      };
      const svc = new BookService(mockQueryBus);
      expect(await svc.getBookById('nonexistent')).toBeNull();
    });

    it('handles empty array from getAllBooks', async () => {
      const mockQueryBus: IQueryBus = {
        execute: vi.fn(async () => []),
      };
      const svc = new BookService(mockQueryBus);
      expect(await svc.getAllBooks(null)).toEqual([]);
    });
  });

  describe('ChapterService', () => {
    it('forwards getAllChapters to QueryBus', async () => {
      const mockQueryBus: IQueryBus = {
        execute: vi.fn(async () => ['c1']),
      };
      const svc = new ChapterService(mockQueryBus);
      expect(await svc.getAllChapters(null)).toEqual(['c1']);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetAllChaptersQuery),
      );
    });

    it('forwards getChapterById to QueryBus', async () => {
      const mockQueryBus: IQueryBus = {
        execute: vi.fn(async () => ({ id: 'c1' })),
      };
      const svc = new ChapterService(mockQueryBus);
      expect(await svc.getChapterById('c1')).toEqual({ id: 'c1' });
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetChapterByIdQuery),
      );
    });

    it('passes filter to getAllChapters', async () => {
      const mockQueryBus: IQueryBus = {
        execute: vi.fn(async (query) => {
          if (query instanceof GetAllChaptersQuery && query.filter) {
            return ['filtered-chapter'];
          }
          return ['all-chapters'];
        }),
      };
      const svc = new ChapterService(mockQueryBus);
      expect(await svc.getAllChapters('ocean')).toEqual(['filtered-chapter']);
    });

    it('handles null result from getChapterById', async () => {
      const mockQueryBus: IQueryBus = {
        execute: vi.fn(async () => null),
      };
      const svc = new ChapterService(mockQueryBus);
      expect(await svc.getChapterById('nonexistent')).toBeNull();
    });

    it('handles empty array from getAllChapters', async () => {
      const mockQueryBus: IQueryBus = {
        execute: vi.fn(async () => []),
      };
      const svc = new ChapterService(mockQueryBus);
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
