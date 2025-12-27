import { inject, injectable } from 'tsyringe';
import { type IQueryBus, IQueryBusToken } from '~/application/cqrs';
import {
  GetAllBooksQuery,
  GetBookByIdQuery,
  SelectRandomBookQuery,
} from '~/application/queries/books';

@injectable()
export default class BookService {
  constructor(@inject(IQueryBusToken) private readonly queryBus: IQueryBus) {}

  async getAllBooks(filter: string | null) {
    return this.queryBus.execute(new GetAllBooksQuery(filter));
  }

  async getBookById(id: string) {
    return this.queryBus.execute(new GetBookByIdQuery(id));
  }

  async selectRandomBook() {
    return this.queryBus.execute(new SelectRandomBookQuery());
  }
}
