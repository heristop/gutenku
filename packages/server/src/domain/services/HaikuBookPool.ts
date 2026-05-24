import type { BookValueWithChapters } from '~/shared/types';
import type { IBookRepository } from '~/domain/repositories/IBookRepository';

/**
 * Lazily-refilled pool of random books drawn from the repository. Each call
 * pops one book; when the pool is empty it refills with `poolSize` books, and
 * if even that yields nothing it falls back to fetching a single random book.
 */
export class HaikuBookPool {
  private pool: BookValueWithChapters[] = [];

  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly poolSize: number,
  ) {}

  reset(): void {
    this.pool = [];
  }

  async next(): Promise<BookValueWithChapters> {
    if (this.pool.length === 0) {
      this.pool = await this.bookRepository.selectRandomBooks(this.poolSize);
    }

    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }

    return this.bookRepository.selectRandomBook();
  }
}
