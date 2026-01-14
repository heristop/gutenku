import { Command } from '~/application/cqrs/ICommand';

export interface ImportBookResult {
  bookId: number;
  fetched: boolean;
  deleted: boolean;
  saved: boolean;
  alreadyExists: boolean;
  chaptersCount: number;
  title?: string;
  error?: string;
  source?: 'db' | 'new';
}

export class ImportBookCommand extends Command<ImportBookResult> {
  constructor(
    public readonly bookId: number,
    public readonly deleteFirst: boolean = false,
    public readonly dataDirectory: string = './data',
  ) {
    super();
  }
}
