import type { BookValue } from '../../shared/types';

export interface CreateBookInput {
  reference: number;
  title: string;
  author: string;
}

export interface DeleteBookResult {
  deleted: boolean;
  chaptersDeleted: number;
}

export interface IBookRepository {
  getAllBooks(filter: string | null): Promise<BookValue[]>;
  getBookById(id: string): Promise<BookValue | null>;
  selectRandomBook(): Promise<BookValue>;
  selectRandomBooks(count: number): Promise<BookValue[]>;

  // Book import operations
  existsByReference(reference: number): Promise<boolean>;
  findByReference(reference: number): Promise<BookValue | null>;
  create(input: CreateBookInput): Promise<string>;
  addChapter(bookId: string, chapterId: string): Promise<void>;
  addChapters(bookId: string, chapterIds: string[]): Promise<void>;
  deleteByReference(reference: number): Promise<DeleteBookResult>;
}

export const IBookRepositoryToken = 'IBookRepository';
