import { Command } from '~/application/cqrs/ICommand';

export interface BatchImportResult {
  totalBooks: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  results: Array<{
    bookId: number;
    success: boolean;
    chaptersCount: number;
    title?: string;
    error?: string;
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
