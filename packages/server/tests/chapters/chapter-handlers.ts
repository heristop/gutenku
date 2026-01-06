import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GetAllChaptersHandler } from '../../src/application/queries/chapters/GetAllChaptersHandler';
import { GetAllChaptersQuery } from '../../src/application/queries/chapters/GetAllChaptersQuery';
import { GetChapterByIdHandler } from '../../src/application/queries/chapters/GetChapterByIdHandler';
import { GetChapterByIdQuery } from '../../src/application/queries/chapters/GetChapterByIdQuery';
import type { IChapterRepository } from '../../src/domain/repositories/IChapterRepository';
import type { ChapterValue } from '../../src/shared/types';

const createMockChapter = (
  overrides: Partial<ChapterValue> = {},
): ChapterValue => ({
  id: 'ch-1',
  reference: '1',
  title: 'Chapter 1',
  content: 'This is the content of chapter 1.',
  bookId: 'book-1',
  ...overrides,
});

describe('Chapter Query Handlers', () => {
  describe('GetAllChaptersHandler', () => {
    let handler: GetAllChaptersHandler;
    let mockChapterRepo: IChapterRepository;

    beforeEach(() => {
      mockChapterRepo = {
        getAllChapters: vi.fn(),
        getChapterById: vi.fn(),
        getFilteredChapters: vi.fn(),
        createMany: vi.fn(),
        deleteByBookId: vi.fn(),
      };
      handler = new GetAllChaptersHandler(mockChapterRepo);
    });

    it('returns all chapters without filter', async () => {
      const mockChapters = [
        createMockChapter({ id: 'ch-1', title: 'Chapter 1' }),
        createMockChapter({ id: 'ch-2', title: 'Chapter 2' }),
        createMockChapter({ id: 'ch-3', title: 'Chapter 3' }),
      ];
      vi.mocked(mockChapterRepo.getAllChapters).mockResolvedValue(mockChapters);

      const query = new GetAllChaptersQuery();
      const result = await handler.execute(query);

      expect(result).toHaveLength(3);
      expect(mockChapterRepo.getAllChapters).toHaveBeenCalledWith(null);
    });

    it('returns filtered chapters when filter provided', async () => {
      const mockChapters = [
        createMockChapter({ id: 'ch-1', title: 'Adventure' }),
      ];
      vi.mocked(mockChapterRepo.getAllChapters).mockResolvedValue(mockChapters);

      const query = new GetAllChaptersQuery('adventure');
      const result = await handler.execute(query);

      expect(result).toHaveLength(1);
      expect(mockChapterRepo.getAllChapters).toHaveBeenCalledWith('adventure');
    });

    it('returns empty array when no chapters found', async () => {
      vi.mocked(mockChapterRepo.getAllChapters).mockResolvedValue([]);

      const query = new GetAllChaptersQuery();
      const result = await handler.execute(query);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('handles null filter explicitly', async () => {
      const mockChapters = [createMockChapter()];
      vi.mocked(mockChapterRepo.getAllChapters).mockResolvedValue(mockChapters);

      const query = new GetAllChaptersQuery(null);
      await handler.execute(query);

      expect(mockChapterRepo.getAllChapters).toHaveBeenCalledWith(null);
    });

    it('handles undefined filter', async () => {
      const mockChapters = [createMockChapter()];
      vi.mocked(mockChapterRepo.getAllChapters).mockResolvedValue(mockChapters);

      const query = new GetAllChaptersQuery(undefined);
      await handler.execute(query);

      expect(mockChapterRepo.getAllChapters).toHaveBeenCalledWith(null);
    });

    it('propagates repository errors', async () => {
      vi.mocked(mockChapterRepo.getAllChapters).mockRejectedValue(
        new Error('Database connection failed'),
      );

      const query = new GetAllChaptersQuery();

      await expect(handler.execute(query)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('returns chapters with all properties', async () => {
      const mockChapter = createMockChapter({
        id: 'ch-detailed',
        reference: '5',
        title: 'Detailed Chapter',
        content: 'Very long content here...',
        bookId: 'book-42',
      });
      vi.mocked(mockChapterRepo.getAllChapters).mockResolvedValue([mockChapter]);

      const query = new GetAllChaptersQuery();
      const result = await handler.execute(query);

      expect(result[0]).toEqual(mockChapter);
      expect(result[0].id).toBe('ch-detailed');
      expect(result[0].reference).toBe('5');
      expect(result[0].title).toBe('Detailed Chapter');
      expect(result[0].bookId).toBe('book-42');
    });
  });

  describe('GetChapterByIdHandler', () => {
    let handler: GetChapterByIdHandler;
    let mockChapterRepo: IChapterRepository;

    beforeEach(() => {
      mockChapterRepo = {
        getAllChapters: vi.fn(),
        getChapterById: vi.fn(),
        getFilteredChapters: vi.fn(),
        createMany: vi.fn(),
        deleteByBookId: vi.fn(),
      };
      handler = new GetChapterByIdHandler(mockChapterRepo);
    });

    it('returns chapter when found', async () => {
      const mockChapter = createMockChapter({
        id: 'ch-123',
        title: 'Found Chapter',
      });
      vi.mocked(mockChapterRepo.getChapterById).mockResolvedValue(mockChapter);

      const query = new GetChapterByIdQuery('ch-123');
      const result = await handler.execute(query);

      expect(result).toBe(mockChapter);
      expect(mockChapterRepo.getChapterById).toHaveBeenCalledWith('ch-123');
    });

    it('returns null when chapter not found', async () => {
      vi.mocked(mockChapterRepo.getChapterById).mockResolvedValue(null);

      const query = new GetChapterByIdQuery('non-existent-id');
      const result = await handler.execute(query);

      expect(result).toBeNull();
      expect(mockChapterRepo.getChapterById).toHaveBeenCalledWith(
        'non-existent-id',
      );
    });

    it('handles different ID formats', async () => {
      const mockChapter = createMockChapter({ id: '507f1f77bcf86cd799439011' });
      vi.mocked(mockChapterRepo.getChapterById).mockResolvedValue(mockChapter);

      const query = new GetChapterByIdQuery('507f1f77bcf86cd799439011');
      const result = await handler.execute(query);

      expect(result).toBe(mockChapter);
    });

    it('propagates repository errors', async () => {
      vi.mocked(mockChapterRepo.getChapterById).mockRejectedValue(
        new Error('Invalid ID format'),
      );

      const query = new GetChapterByIdQuery('invalid');

      await expect(handler.execute(query)).rejects.toThrow('Invalid ID format');
    });

    it('returns chapter with full content', async () => {
      const longContent = 'A'.repeat(10000);
      const mockChapter = createMockChapter({
        id: 'ch-long',
        content: longContent,
      });
      vi.mocked(mockChapterRepo.getChapterById).mockResolvedValue(mockChapter);

      const query = new GetChapterByIdQuery('ch-long');
      const result = await handler.execute(query);

      expect(result?.content).toHaveLength(10000);
    });
  });
});

describe('Chapter Query Classes', () => {
  describe('GetAllChaptersQuery', () => {
    it('stores filter value', () => {
      const query = new GetAllChaptersQuery('nature');
      expect(query.filter).toBe('nature');
    });

    it('defaults filter to undefined', () => {
      const query = new GetAllChaptersQuery();
      expect(query.filter).toBeUndefined();
    });

    it('accepts null filter', () => {
      const query = new GetAllChaptersQuery(null);
      expect(query.filter).toBeNull();
    });
  });

  describe('GetChapterByIdQuery', () => {
    it('stores id value', () => {
      const query = new GetChapterByIdQuery('ch-123');
      expect(query.id).toBe('ch-123');
    });

    it('accepts different id formats', () => {
      const mongoId = '507f1f77bcf86cd799439011';
      const query = new GetChapterByIdQuery(mongoId);
      expect(query.id).toBe(mongoId);
    });
  });
});
