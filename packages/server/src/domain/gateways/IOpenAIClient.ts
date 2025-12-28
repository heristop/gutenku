export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionParams {
  model: string;
  temperature: number;
  max_completion_tokens: number;
  stop?: string[];
  messages: ChatMessage[];
  reasoning_effort?: 'none' | 'low' | 'medium' | 'high';
}

export interface ChatCompletionChoice {
  message: { content: string };
}

export interface ChatCompletionResult {
  choices: ChatCompletionChoice[];
}

export interface IOpenAIClient {
  configure(apiKey: string): void;
  chatCompletionsCreate(
    params: ChatCompletionParams,
  ): Promise<ChatCompletionResult>;
}

export const IOpenAIClientToken = 'IOpenAIClient';
