import { Command } from '~/application/cqrs/ICommand';

export interface BatchImportResult {
  totalBooks: number;
  newCount: number;
  skippedCount: number;
  failedCount: number;
  totalChapters: number;
  results: Array<{
    bookId: number;
    success: boolean;
    alreadyExists: boolean;
    chaptersCount: number;
    title?: string;
    error?: string;
    source?: 'db' | 'new';
  }>;
}

export type ProgressCallback = (
  bookId: number,
  index: number,
  total: number,
  title?: string,
) => void;

export class BatchImportBooksCommand extends Command<BatchImportResult> {
  constructor(
    public readonly bookIds: number[],
    public readonly deleteFirst: boolean = false,
    public readonly dataDirectory: string = './data',
    public readonly onProgress?: ProgressCallback,
  ) {
    super();
  }
}
