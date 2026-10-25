import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions.js';
import type {
  ChatCompletionParams,
  ChatCompletionResult,
  IOpenAIClient,
} from '~/domain/gateways/IOpenAIClient.js';
import { injectable } from 'tsyringe';
import {
  currentOpenAIKey,
  reportOpenAIFailure,
} from '~/infrastructure/external/openai-scope';

@injectable()
export default class OpenAIClient implements IOpenAIClient {
  private configuredKey: string | null = null;

  configure(apiKey: string): void {
    this.configuredKey = apiKey;
  }

  async chatCompletionsCreate(
    params: ChatCompletionParams,
  ): Promise<ChatCompletionResult> {
    // The service holding this client is shared by every request: the key
    // is read from the request at call time, never kept from a previous one
    const apiKey = currentOpenAIKey() ?? this.configuredKey;

    if (!apiKey) {
      throw new Error('OpenAI client not configured');
    }

    try {
      const completion = await new OpenAI({ apiKey }).chat.completions.create(
        params as ChatCompletionCreateParamsNonStreaming,
      );

      return {
        choices: completion.choices.map((c) => ({
          message: { content: c.message?.content ?? '' },
        })),
      };
    } catch (error) {
      reportOpenAIFailure(error);
      throw error;
    }
  }
}
