import { injectable } from 'tsyringe';
import BookRepository from '../../infrastructure/repositories/BookRepository';

@injectable()
export default class BookService {
    constructor(private readonly bookRepository: BookRepository) {}

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
