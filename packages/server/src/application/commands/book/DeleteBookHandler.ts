import { inject, injectable } from 'tsyringe';
import type { ICommandHandler } from '~/application/cqrs/ICommandHandler';
import type { DeleteBookCommand, DeleteBookResult } from './DeleteBookCommand';
import {
  type IBookRepository,
  IBookRepositoryToken,
} from '~/domain/repositories/IBookRepository';

@injectable()
export class DeleteBookHandler implements ICommandHandler<
  DeleteBookCommand,
  DeleteBookResult
> {
  constructor(
    @inject(IBookRepositoryToken)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(command: DeleteBookCommand): Promise<DeleteBookResult> {
    const result = await this.bookRepository.deleteByReference(command.bookId);

    return {
      bookId: command.bookId,
      deleted: result.deleted,
      chaptersDeleted: result.chaptersDeleted,
    };
  }
}
