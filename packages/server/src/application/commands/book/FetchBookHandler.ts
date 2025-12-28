import { inject, injectable } from 'tsyringe';
import type { ICommandHandler } from '~/application/cqrs/ICommandHandler';
import type { FetchBookCommand, FetchBookResult } from './FetchBookCommand';
import {
  type IGutenbergClient,
  IGutenbergClientToken,
} from '~/domain/gateways/IGutenbergClient';
import {
  type IFileSystemService,
  IFileSystemServiceToken,
} from '~/domain/gateways/IFileSystemService';
import { join } from 'node:path';

@injectable()
export class FetchBookHandler implements ICommandHandler<
  FetchBookCommand,
  FetchBookResult
> {
  constructor(
    @inject(IGutenbergClientToken)
    private readonly gutenbergClient: IGutenbergClient,
    @inject(IFileSystemServiceToken)
    private readonly fileSystem: IFileSystemService,
  ) {}

  async execute(command: FetchBookCommand): Promise<FetchBookResult> {
    const filePath = join(command.dataDirectory, `book_${command.bookId}.txt`);

    // Check if file already exists
    if (await this.fileSystem.fileExists(filePath)) {
      return {
        bookId: command.bookId,
        filePath,
        success: true,
        alreadyExists: true,
      };
    }

    try {
      // Fetch book content from Gutenberg
      const content = await this.gutenbergClient.fetchBook(command.bookId);

      // Write to file
      await this.fileSystem.writeFile(filePath, content);

      return {
        bookId: command.bookId,
        filePath,
        success: true,
        alreadyExists: false,
      };
    } catch (error) {
      console.error(`Failed to fetch book ${command.bookId}:`, error);
      return {
        bookId: command.bookId,
        filePath,
        success: false,
        alreadyExists: false,
      };
    }
  }
}
