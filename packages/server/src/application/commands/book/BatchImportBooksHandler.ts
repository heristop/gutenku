import { inject, injectable } from 'tsyringe';
import type { ICommandHandler } from '~/application/cqrs/ICommandHandler';
import type {
  BatchImportBooksCommand,
  BatchImportResult,
} from './BatchImportBooksCommand';
import {
  type ICommandBus,
  ICommandBusToken,
} from '~/application/cqrs/ICommandBus';
import { ImportBookCommand } from './ImportBookCommand';

@injectable()
export class BatchImportBooksHandler implements ICommandHandler<
  BatchImportBooksCommand,
  BatchImportResult
> {
  constructor(
    @inject(ICommandBusToken)
    private readonly commandBus: ICommandBus,
  ) {}

  async execute(command: BatchImportBooksCommand): Promise<BatchImportResult> {
    const results: Array<{
      bookId: number;
      success: boolean;
      chaptersCount: number;
      title?: string;
      error?: string;
    }> = [];

    const total = command.bookIds.length;

    for (let i = 0; i < total; i++) {
      const bookId = command.bookIds[i];
      let title: string | undefined;

      try {
        const result = await this.commandBus.execute(
          new ImportBookCommand(
            bookId,
            command.deleteFirst,
            command.dataDirectory,
          ),
        );

        title = result.title;
        results.push({
          bookId,
          success: result.saved,
          chaptersCount: result.chaptersCount,
          title: result.title,
          error: result.error,
        });
      } catch (error) {
        results.push({
          bookId,
          success: false,
          chaptersCount: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      command.onProgress?.(bookId, i + 1, total, title);
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter(
      (r) => !r.success && r.error !== undefined,
    ).length;
    const skippedCount = results.filter(
      (r) => !r.success && r.error === undefined,
    ).length;

    return {
      totalBooks: command.bookIds.length,
      successCount,
      failedCount,
      skippedCount,
      results,
    };
  }
}
