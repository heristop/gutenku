import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import BookService from '../src/application/services/BookService';
import ChapterService from '../src/application/services/ChapterService';
import { PubSubService } from '../src/infrastructure/services/PubSubService';
import BookRepository from '../src/infrastructure/repositories/BookRepository';
import ChapterRepository from '../src/infrastructure/repositories/ChapterRepository';

describe('Application services', () => {
  it('BookService forwards to repository', async () => {
    class StubBookRepository extends BookRepository {
      getAllBooks = vi.fn(async (_filter: string | null) => ['b1']);
      getBookById = vi.fn(async (_id: string) => ({ id: '1' }));
      selectRandomBook = vi.fn(async () => ({ id: 'r1' }) as unknown);
    }
    const repo = new StubBookRepository();
    const svc = new BookService(repo);
    expect(await svc.getAllBooks(null)).toEqual(['b1']);
    expect(await svc.getBookById('1')).toEqual({ id: '1' });
    expect(await svc.selectRandomBook()).toEqual({ id: 'r1' });
    expect(repo.getAllBooks).toHaveBeenCalledWith(null);
    expect(repo.getBookById).toHaveBeenCalledWith('1');
    expect(repo.selectRandomBook).toHaveBeenCalled();
  });

  it('ChapterService forwards to repository', async () => {
    class StubChapterRepository extends ChapterRepository {
      getAllChapters = vi.fn(async (_filter: string | null) => ['c1']);
      getChapterById = vi.fn(async (_id: string) => ({ id: 'c1' }));
    }
    const repo = new StubChapterRepository();
    const svc = new ChapterService(repo);
    expect(await svc.getAllChapters(null)).toEqual(['c1']);
    expect(await svc.getChapterById('c1')).toEqual({ id: 'c1' });
    expect(repo.getAllChapters).toHaveBeenCalledWith(null);
    expect(repo.getChapterById).toHaveBeenCalledWith('c1');
  });

  it('PubSubService exposes a PubSub instance', () => {
    const pub = new PubSubService().instance;
    expect(typeof pub.asyncIterator).toBe('function');
  });
});
