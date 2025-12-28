import { Command } from '~/application/cqrs/ICommand';

export interface DeleteBookResult {
  bookId: number;
  deleted: boolean;
  chaptersDeleted: number;
}

export class DeleteBookCommand extends Command<DeleteBookResult> {
  constructor(public readonly bookId: number) {
    super();
  }
}
