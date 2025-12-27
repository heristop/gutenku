import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { SelectRandomBookQuery } from './SelectRandomBookQuery';
import {
  type IBookRepository,
  IBookRepositoryToken,
} from '~/domain/repositories/IBookRepository';
import type { BookValue } from '~/shared/types';

@injectable()
export class SelectRandomBookHandler implements IQueryHandler<
  SelectRandomBookQuery,
  BookValue
> {
  constructor(
    @inject(IBookRepositoryToken)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(_query: SelectRandomBookQuery): Promise<BookValue> {
    return this.bookRepository.selectRandomBook();
  }
}
