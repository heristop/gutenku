import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  classifyOpenAIError,
  currentOpenAIKey,
  reportOpenAIFailure,
  runWithOpenAIScope,
  scopedGenerator,
  type OpenAIScope,
} from '~/infrastructure/external/openai-scope';
import { checkOpenAIKey } from '~/infrastructure/external/openai-key-check';

describe('OpenAI request scope', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers the request's key, else the server's", async () => {
    vi.stubEnv('OPENAI_API_KEY', 'server-key');

    expect(currentOpenAIKey()).toBe('server-key');
    await runWithOpenAIScope({ apiKey: 'visitor-key' }, async () => {
      await Promise.resolve();
      expect(currentOpenAIKey()).toBe('visitor-key');
    });
    expect(currentOpenAIKey()).toBe('server-key');
  });

  it('keeps two concurrent requests on their own keys', async () => {
    const seen: string[] = [];
    const request = (key: string, delay: number) =>
      runWithOpenAIScope({ apiKey: key }, async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, delay);
        });
        seen.push(`${key}:${currentOpenAIKey()}`);
      });

    await Promise.all([request('a', 10), request('b', 1)]);

    expect(seen.sort()).toEqual(['a:a', 'b:b']);
  });

  it('carries the key into work a generator starts, step after step', async () => {
    async function* steps() {
      yield currentOpenAIKey();
      const later = new Promise<string | undefined>((resolve) => {
        setTimeout(() => resolve(currentOpenAIKey()), 1);
      });
      yield await later;
    }
    const values: (string | undefined)[] = [];

    for await (const value of scopedGenerator({ apiKey: 'visitor' }, steps())) {
      values.push(value);
    }

    expect(values).toEqual(['visitor', 'visitor']);
  });

  it('records the first failure on the request', () => {
    const scope: OpenAIScope = {};

    runWithOpenAIScope(scope, () => {
      reportOpenAIFailure({ status: 401 });
      reportOpenAIFailure({ status: 500 });
    });

    expect(scope.failure).toBe('invalid_key');
  });

  it('names failures without reading their messages', () => {
    expect(classifyOpenAIError({ status: 401 })).toBe('invalid_key');
    expect(
      classifyOpenAIError({ status: 429, code: 'insufficient_quota' }),
    ).toBe('no_quota');
    expect(classifyOpenAIError({ status: 503 })).toBe('unavailable');
    expect(classifyOpenAIError(new Error('boom'))).toBe('unavailable');
  });

  it('rejects a malformed key without calling OpenAI', async () => {
    await expect(checkOpenAIKey('nope')).resolves.toBe('INVALID');
    await expect(checkOpenAIKey()).resolves.toBe('INVALID');
  });
});
