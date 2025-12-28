import { injectable } from 'tsyringe';
import type { IGutenbergClient } from '~/domain/gateways/IGutenbergClient';
import { BookFetchException } from '~/domain/exceptions/book';

@injectable()
export class GutenbergClient implements IGutenbergClient {
  private readonly baseUrl = 'https://www.gutenberg.org/cache/epub';

  async fetchBook(gutenbergId: number): Promise<string> {
    const url = this.buildUrl(gutenbergId);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new BookFetchException(gutenbergId, {
          metadata: {
            statusCode: response.status,
            url,
          },
        });
      }

      return await response.text();
    } catch (error) {
      if (error instanceof BookFetchException) {
        throw error;
      }

      throw new BookFetchException(gutenbergId, {
        cause: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          url,
        },
      });
    }
  }

  async isAvailable(gutenbergId: number): Promise<boolean> {
    const url = this.buildUrl(gutenbergId);

    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  private buildUrl(gutenbergId: number): string {
    return `${this.baseUrl}/${gutenbergId}/pg${gutenbergId}.txt`;
  }
}
