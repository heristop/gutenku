import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  resolveAIAccess,
  withoutDisallowedAI,
} from '~/presentation/graphql/ai-access';

describe('AI access gate', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows AI outside production when a server key exists', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');

    expect(resolveAIAccess().allowed).toBeTruthy();
  });

  it('denies AI without a server key', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('OPENAI_API_KEY', '');

    expect(resolveAIAccess().allowed).toBeFalsy();
  });

  it('denies visitors in production, even with no internal key configured', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    vi.stubEnv('INTERNAL_API_KEY', '');

    expect(resolveAIAccess().allowed).toBeFalsy();
    expect(resolveAIAccess('anything').allowed).toBeFalsy();
  });

  it('allows the internal key in production, and only that key', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    vi.stubEnv('INTERNAL_API_KEY', 'secret-key');

    expect(resolveAIAccess('secret-key').allowed).toBeTruthy();
    expect(resolveAIAccess('secret-kez').allowed).toBeFalsy();
    expect(resolveAIAccess('secret').allowed).toBeFalsy();
    expect(resolveAIAccess(42).allowed).toBeFalsy();
  });

  it("grants AI on a visitor's own key, even in production without one", () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('OPENAI_API_KEY', '');
    const key = 'sk-proj-abcdefghijklmnopqrstuvwxyz0123';

    expect(resolveAIAccess(undefined, key)).toEqual({
      allowed: true,
      apiKey: key,
    });
  });

  it('ignores a visitor key that is not shaped like one', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');

    for (const key of [
      '',
      'sk-short',
      'not-a-key-at-all-0123456789',
      'sk-has space 0123456789abcdef',
      42,
    ]) {
      expect(resolveAIAccess(undefined, key).allowed).toBeFalsy();
    }
  });

  it('strips AI text and AI image themes when denied', () => {
    const args = { useAI: true, useImageAI: true, theme: 'sumie', filter: 'x' };

    expect(withoutDisallowedAI(args, { allowed: false })).toEqual({
      useAI: false,
      useImageAI: false,
      theme: 'random',
      filter: 'x',
    });
  });

  it('keeps classic themes and leaves allowed requests untouched', () => {
    const args = { useAI: true, theme: 'exlibris' };

    expect(withoutDisallowedAI(args, { allowed: false }).theme).toBe(
      'exlibris',
    );
    expect(withoutDisallowedAI(args, { allowed: true })).toBe(args);
  });

  it('defaults to the environment when no context is given', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');

    expect(withoutDisallowedAI({ useAI: true }).useAI).toBeFalsy();
  });
});
