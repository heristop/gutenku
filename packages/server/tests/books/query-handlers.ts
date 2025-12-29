import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GetAllBooksHandler } from '../../src/application/queries/books/GetAllBooksHandler';
import { GetAllBooksQuery } from '../../src/application/queries/books/GetAllBooksQuery';
import { GetBookByIdHandler } from '../../src/application/queries/books/GetBookByIdHandler';
import { GetBookByIdQuery } from '../../src/application/queries/books/GetBookByIdQuery';
import { SelectRandomBookHandler } from '../../src/application/queries/books/SelectRandomBookHandler';
import { SelectRandomBookQuery } from '../../src/application/queries/books/SelectRandomBookQuery';
import type { IBookRepository } from '../../src/domain/repositories/IBookRepository';
import type { BookValue } from '../../src/shared/types';

describe('Book Query Handlers', () => {
  const mockBooks: BookValue[] = [
    {
      id: 'book-1',
      reference: 1234,
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
    },
    {
      id: 'book-2',
      reference: 5678,
      title: 'Moby Dick',
      author: 'Herman Melville',
    },
    {
      id: 'book-3',
      reference: 9012,
      title: 'Dracula',
      author: 'Bram Stoker',
    },
  ];

  describe('GetAllBooksHandler', () => {
    let handler: GetAllBooksHandler;
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
      handler = new GetAllBooksHandler(mockBookRepo);
    });

    it('returns all books without filter', async () => {
      vi.mocked(mockBookRepo.getAllBooks).mockResolvedValue(mockBooks);

      const query = new GetAllBooksQuery();
      const result = await handler.execute(query);

      expect(result).toEqual(mockBooks);
      expect(result.length).toBe(3);
      expect(mockBookRepo.getAllBooks).toHaveBeenCalledWith(null);
    });

    it('returns filtered books when filter is provided', async () => {
      const filteredBooks = [mockBooks[0]];
      vi.mocked(mockBookRepo.getAllBooks).mockResolvedValue(filteredBooks);

      const query = new GetAllBooksQuery('Austen');
      const result = await handler.execute(query);

      expect(result).toEqual(filteredBooks);
      expect(result.length).toBe(1);
      expect(mockBookRepo.getAllBooks).toHaveBeenCalledWith('Austen');
    });

    it('returns empty array when no books match filter', async () => {
      vi.mocked(mockBookRepo.getAllBooks).mockResolvedValue([]);

      const query = new GetAllBooksQuery('NonExistentBook');
      const result = await handler.execute(query);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('handles null filter explicitly', async () => {
      vi.mocked(mockBookRepo.getAllBooks).mockResolvedValue(mockBooks);

      const query = new GetAllBooksQuery(null);
      const result = await handler.execute(query);

      expect(result).toEqual(mockBooks);
      expect(mockBookRepo.getAllBooks).toHaveBeenCalledWith(null);
    });
  });

  describe('GetBookByIdHandler', () => {
    let handler: GetBookByIdHandler;
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
      handler = new GetBookByIdHandler(mockBookRepo);
    });

    it('returns book when found', async () => {
      const expectedBook = mockBooks[0];
      vi.mocked(mockBookRepo.getBookById).mockResolvedValue(expectedBook);

      const query = new GetBookByIdQuery('book-1');
      const result = await handler.execute(query);

      expect(result).toEqual(expectedBook);
      expect(result?.title).toBe('Pride and Prejudice');
      expect(mockBookRepo.getBookById).toHaveBeenCalledWith('book-1');
    });

    it('returns null when book not found', async () => {
      vi.mocked(mockBookRepo.getBookById).mockResolvedValue(null);

      const query = new GetBookByIdQuery('non-existent-id');
      const result = await handler.execute(query);

      expect(result).toBeNull();
      expect(mockBookRepo.getBookById).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('SelectRandomBookHandler', () => {
    let handler: SelectRandomBookHandler;
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
      handler = new SelectRandomBookHandler(mockBookRepo);
    });

    it('returns a random book', async () => {
      const randomBook = mockBooks[1];
      vi.mocked(mockBookRepo.selectRandomBook).mockResolvedValue(randomBook);

      const query = new SelectRandomBookQuery();
      const result = await handler.execute(query);

      expect(result).toEqual(randomBook);
      expect(result.title).toBe('Moby Dick');
      expect(mockBookRepo.selectRandomBook).toHaveBeenCalled();
    });

    it('query can be instantiated without parameters', () => {
      const query = new SelectRandomBookQuery();
      expect(query).toBeDefined();
    });
  });
});

describe('Book Query Classes', () => {
  it('GetAllBooksQuery stores filter', () => {
    const query = new GetAllBooksQuery('Austen');
    expect(query.filter).toBe('Austen');
  });

  it('GetAllBooksQuery filter defaults to undefined', () => {
    const query = new GetAllBooksQuery();
    expect(query.filter).toBeUndefined();
  });

  it('GetAllBooksQuery accepts null filter', () => {
    const query = new GetAllBooksQuery(null);
    expect(query.filter).toBeNull();
  });

  it('GetBookByIdQuery stores id', () => {
    const query = new GetBookByIdQuery('book-123');
    expect(query.id).toBe('book-123');
  });

  it('SelectRandomBookQuery can be instantiated', () => {
    const query = new SelectRandomBookQuery();
    expect(query).toBeDefined();
  });
});
