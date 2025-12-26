import type { BookValue } from '../../shared/types';

export interface IBookRepository {
  getAllBooks(filter: string | null): Promise<BookValue[]>;
  getBookById(id: string): Promise<BookValue | null>;
  selectRandomBook(): Promise<BookValue>;
}

export const IBookRepositoryToken = 'IBookRepository';
