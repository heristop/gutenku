import OpenAI from 'openai';
import { classifyOpenAIError } from '~/infrastructure/external/openai-scope';
import { isPlausibleOpenAIKey } from '~/presentation/graphql/ai-access';

export type OpenAIKeyStatus = 'VALID' | 'INVALID' | 'UNAVAILABLE';

const CHECK_TIMEOUT_MS = 10_000;

// Asks OpenAI whether a visitor's key opens the door, with a call that costs
// nothing (listing models). It can't tell whether the account has credit:
// that only shows on the first paid call.
export async function checkOpenAIKey(key: unknown): Promise<OpenAIKeyStatus> {
  if (!isPlausibleOpenAIKey(key)) {
    return 'INVALID';
  }

  try {
    await new OpenAI({
      apiKey: key,
      timeout: CHECK_TIMEOUT_MS,
      maxRetries: 0,
    }).models.list();

    return 'VALID';
  } catch (error) {
    return classifyOpenAIError(error) === 'invalid_key'
      ? 'INVALID'
      : 'UNAVAILABLE';
  }
}
