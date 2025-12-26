import type { ChapterValue } from '../../shared/types';

export interface IChapterRepository {
  getAllChapters(filter: string | null): Promise<ChapterValue[]>;
  getChapterById(id: string): Promise<ChapterValue | null>;
  getFilteredChapters(filterWords: string[]): Promise<ChapterValue[]>;
}

export const IChapterRepositoryToken = 'IChapterRepository';
