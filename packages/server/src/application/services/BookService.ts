import { inject, injectable } from 'tsyringe';
import type { IBookRepository } from '~/domain/repositories/IBookRepository';

@injectable()
export default class BookService {
  constructor(
    @inject('IBookRepository') private readonly bookRepository: IBookRepository,
  ) {}

  async getAllBooks(filter: string | null) {
    return await this.bookRepository.getAllBooks(filter);
  }

  async getBookById(id: string) {
    return await this.bookRepository.getBookById(id);
  }

  async selectRandomBook() {
    return this.bookRepository.selectRandomBook();
  }
}
