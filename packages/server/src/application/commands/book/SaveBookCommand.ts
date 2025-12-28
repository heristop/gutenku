import { Command } from '~/application/cqrs/ICommand';

export interface SaveBookResult {
  bookId: number;
  success: boolean;
  alreadyExists: boolean;
  chaptersCount: number;
  title?: string;
  error?: string;
}

export class SaveBookCommand extends Command<SaveBookResult> {
  constructor(
    public readonly bookId: number,
    public readonly dataDirectory: string = './data',
  ) {
    super();
  }
}
