import { injectable } from 'tsyringe';
import type { IGutenbergClient } from '~/domain/gateways/IGutenbergClient';
import { BookFetchException } from '~/domain/exceptions/book';

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  timeoutMs: number;
}

@injectable()
export class GutenbergClient implements IGutenbergClient {
  private readonly baseUrl = 'https://www.gutenberg.org/cache/epub';

  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    timeoutMs: 30000, // 30 seconds
  };

  async fetchBook(gutenbergId: number): Promise<string> {
    const url = this.buildUrl(gutenbergId);

    return this.fetchWithRetry(url, gutenbergId);
  }

  private async fetchWithRetry(
    url: string,
    gutenbergId: number,
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url);

        if (!response.ok) {
          throw new BookFetchException(gutenbergId, {
            metadata: {
              statusCode: response.status,
              url,
              attempt: attempt + 1,
            },
          });
        }

        return await response.text();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on 4xx errors (client errors)

        if (error instanceof BookFetchException) {
          const status = error.metadata?.statusCode as number | undefined;
          if (status && status >= 400 && status < 500) {
            throw error;
          }
        }

        // Wait before retrying (exponential backoff)

        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.retryConfig.baseDelayMs * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw new BookFetchException(gutenbergId, {
      cause: lastError ?? undefined,
      metadata: {
        url,
        retriesExhausted: true,
        maxRetries: this.retryConfig.maxRetries,
      },
    });
  }

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.retryConfig.timeoutMs,
    );

    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async isAvailable(gutenbergId: number): Promise<boolean> {
    const url = this.buildUrl(gutenbergId);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.retryConfig.timeoutMs,
      );

      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
        });
        return response.ok;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch {
      return false;
    }
  }

  private buildUrl(gutenbergId: number): string {
    return `${this.baseUrl}/${gutenbergId}/pg${gutenbergId}.txt`;
  }
}
