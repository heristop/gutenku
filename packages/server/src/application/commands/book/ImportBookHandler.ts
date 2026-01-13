import { inject, injectable } from 'tsyringe';
import type { ICommandHandler } from '~/application/cqrs/ICommandHandler';
import type { ImportBookCommand, ImportBookResult } from './ImportBookCommand';
import {
  type ICommandBus,
  ICommandBusToken,
} from '~/application/cqrs/ICommandBus';
import { FetchBookCommand } from './FetchBookCommand';
import { DeleteBookCommand } from './DeleteBookCommand';
import { SaveBookCommand } from './SaveBookCommand';

@injectable()
export class ImportBookHandler implements ICommandHandler<
  ImportBookCommand,
  ImportBookResult
> {
  constructor(
    @inject(ICommandBusToken)
    private readonly commandBus: ICommandBus,
  ) {}

  async execute(command: ImportBookCommand): Promise<ImportBookResult> {
    let deleted = false;

    // Optional delete first
    if (command.deleteFirst) {
      const deleteResult = await this.commandBus.execute(
        new DeleteBookCommand(command.bookId),
      );
      deleted = deleteResult.deleted;
    }

    // Fetch book
    const fetchResult = await this.commandBus.execute(
      new FetchBookCommand(command.bookId, command.dataDirectory),
    );

    if (!fetchResult.success) {
      return {
        bookId: command.bookId,
        fetched: false,
        deleted,
        saved: false,
        alreadyExists: false,
        chaptersCount: 0,
        error: 'Failed to fetch book from Gutenberg',
      };
    }

    // Save book
    const saveResult = await this.commandBus.execute(
      new SaveBookCommand(command.bookId, command.dataDirectory),
    );

    return {
      bookId: command.bookId,
      fetched: true,
      deleted,
      saved: saveResult.success,
      alreadyExists: saveResult.alreadyExists,
      chaptersCount: saveResult.chaptersCount,
      title: saveResult.title,
      error: saveResult.error,
    };
  }
}
