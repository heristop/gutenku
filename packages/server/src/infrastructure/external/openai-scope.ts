import { AsyncLocalStorage } from 'node:async_hooks';

// The OpenAI key a request runs with, carried through every await of that
// request without threading it by hand. A visitor's own key lives only here,
// for the time of their request: it is never stored nor logged.
export type OpenAIFailure = 'invalid_key' | 'no_quota' | 'unavailable';

export interface OpenAIScope {
  apiKey?: string;
  // The first OpenAI failure met while serving the request, told back to
  // the visitor in plain words
  failure?: OpenAIFailure;
}

const storage = new AsyncLocalStorage<OpenAIScope>();

export function runWithOpenAIScope<T>(scope: OpenAIScope, run: () => T): T {
  return storage.run(scope, run);
}

// A generator's body runs in whoever calls next(): each step is re-entered
// in the scope so the work it starts (the card, the AI text) keeps the key
export async function* scopedGenerator<T>(
  scope: OpenAIScope,
  generator: AsyncGenerator<T, void>,
): AsyncGenerator<T> {
  try {
    while (true) {
      const step = await storage.run(scope, () => generator.next());

      if (step.done) {
        return;
      }

      yield step.value;
    }
  } finally {
    await storage.run(scope, () => generator.return());
  }
}

// The request's own key first, else the server's
export function currentOpenAIKey(): string | undefined {
  return storage.getStore()?.apiKey || process.env.OPENAI_API_KEY || undefined;
}

export function classifyOpenAIError(error: unknown): OpenAIFailure {
  const { status, code } = (error ?? {}) as { status?: number; code?: string };

  if (status === 401) {
    return 'invalid_key';
  }

  if (code === 'insufficient_quota' || status === 429) {
    return 'no_quota';
  }

  return 'unavailable';
}

// Records a failure on the request (first one wins) and returns its kind.
// Only the kind and status are meant for logs: OpenAI's own messages can
// quote part of the key.
export function reportOpenAIFailure(error: unknown): OpenAIFailure {
  const failure = classifyOpenAIError(error);
  const scope = storage.getStore();

  if (scope && !scope.failure) {
    scope.failure = failure;
  }

  return failure;
}
