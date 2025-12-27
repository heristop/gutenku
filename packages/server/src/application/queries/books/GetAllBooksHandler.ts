import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { GetAllBooksQuery } from './GetAllBooksQuery';
import {
  type IBookRepository,
  IBookRepositoryToken,
} from '~/domain/repositories/IBookRepository';
import type { BookValue } from '~/shared/types';

@injectable()
export class GetAllBooksHandler implements IQueryHandler<
  GetAllBooksQuery,
  BookValue[]
> {
  constructor(
    @inject(IBookRepositoryToken)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(query: GetAllBooksQuery): Promise<BookValue[]> {
    return this.bookRepository.getAllBooks(query.filter ?? null);
  }
}
