import OpenAI from 'openai';
import {
  ChatCompletionParams,
  ChatCompletionResult,
  IOpenAIClient,
} from '../../domain/gateways/IOpenAIClient';
import { injectable } from 'tsyringe';

@injectable()
export default class OpenAIClient implements IOpenAIClient {
  private client: OpenAI | null = null;

  configure(apiKey: string): void {
    this.client = new OpenAI({ apiKey });
  }

  async chatCompletionsCreate(
    params: ChatCompletionParams,
  ): Promise<ChatCompletionResult> {
    if (!this.client) throw new Error('OpenAI client not configured');
    const completion = await this.client.chat.completions.create(
      params as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParams,
    );
    return {
      choices: completion.choices.map((c) => ({
        message: { content: c.message?.content ?? '' },
      })),
    };
  }
}
