import type { ChapterValue } from '../../shared/types';

export interface CreateChapterInput {
  title: string;
  content: string;
  bookId: string;
}

export interface IChapterRepository {
  getAllChapters(filter: string | null): Promise<ChapterValue[]>;
  getChapterById(id: string): Promise<ChapterValue | null>;
  getFilteredChapters(filterWords: string[]): Promise<ChapterValue[]>;
  getChaptersByBookReference(reference: string): Promise<ChapterValue[]>;

  // Chapter import operations
  createMany(chapters: CreateChapterInput[]): Promise<string[]>;
  deleteByBookId(bookId: string): Promise<number>;
}

export const IChapterRepositoryToken = 'IChapterRepository';
