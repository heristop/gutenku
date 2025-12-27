import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { GetBookByIdQuery } from './GetBookByIdQuery';
import {
  type IBookRepository,
  IBookRepositoryToken,
} from '~/domain/repositories/IBookRepository';
import type { BookValue } from '~/shared/types';

@injectable()
export class GetBookByIdHandler implements IQueryHandler<
  GetBookByIdQuery,
  BookValue | null
> {
  constructor(
    @inject(IBookRepositoryToken)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(query: GetBookByIdQuery): Promise<BookValue | null> {
    return this.bookRepository.getBookById(query.id);
  }
}
