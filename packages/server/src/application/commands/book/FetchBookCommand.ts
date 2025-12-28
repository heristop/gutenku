import { Command } from '~/application/cqrs/ICommand';

export interface FetchBookResult {
  bookId: number;
  filePath: string;
  success: boolean;
  alreadyExists: boolean;
}

export class FetchBookCommand extends Command<FetchBookResult> {
  constructor(
    public readonly bookId: number,
    public readonly dataDirectory: string = './data',
  ) {
    super();
  }
}
