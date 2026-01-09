import { inject, injectable } from 'tsyringe';
import type { ICommandHandler } from '~/application/cqrs/ICommandHandler';
import type { SaveBookCommand, SaveBookResult } from './SaveBookCommand';
import {
  type IBookRepository,
  IBookRepositoryToken,
} from '~/domain/repositories/IBookRepository';
import {
  type IChapterRepository,
  IChapterRepositoryToken,
} from '~/domain/repositories/IChapterRepository';
import {
  type IFileSystemService,
  IFileSystemServiceToken,
} from '~/domain/gateways/IFileSystemService';
import { BookParserService } from '~/domain/services/BookParserService';
import { join } from 'node:path';

@injectable()
export class SaveBookHandler implements ICommandHandler<
  SaveBookCommand,
  SaveBookResult
> {
  constructor(
    @inject(IBookRepositoryToken)
    private readonly bookRepository: IBookRepository,
    @inject(IChapterRepositoryToken)
    private readonly chapterRepository: IChapterRepository,
    @inject(IFileSystemServiceToken)
    private readonly fileSystem: IFileSystemService,
    @inject(BookParserService)
    private readonly bookParser: BookParserService,
  ) {}

  async execute(command: SaveBookCommand): Promise<SaveBookResult> {
    const filePath = join(command.dataDirectory, `book_${command.bookId}.txt`);

    // Check if book already exists in DB
    if (await this.bookRepository.existsByReference(command.bookId)) {
      return {
        bookId: command.bookId,
        success: true,
        alreadyExists: true,
        chaptersCount: 0,
      };
    }

    try {
      // Read and parse book file
      const content = await this.fileSystem.readFile(filePath);
      const result = this.bookParser.parseContent(content, command.bookId);

      if (!result.isValid || !result.parsedBook) {
        return {
          bookId: command.bookId,
          success: false,
          alreadyExists: false,
          chaptersCount: result.stats.validChapterCount,
          error: result.errors.join('; '),
        };
      }

      // Create book
      const bookDbId = await this.bookRepository.create({
        reference: command.bookId,
        title: result.parsedBook.title,
        author: result.parsedBook.author,
      });

      // Create chapters and link to book
      const chapterInputs = result.parsedBook.chapters.map((ch) => ({
        title: ch.title,
        content: ch.content,
        bookId: bookDbId,
      }));

      const chapterIds = await this.chapterRepository.createMany(chapterInputs);

      // Link chapters to book (single database call)
      await this.bookRepository.addChapters(bookDbId, chapterIds);

      return {
        bookId: command.bookId,
        success: true,
        alreadyExists: false,
        chaptersCount: chapterIds.length,
        title: result.parsedBook.title,
      };
    } catch (error) {
      return {
        bookId: command.bookId,
        success: false,
        alreadyExists: false,
        chaptersCount: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
