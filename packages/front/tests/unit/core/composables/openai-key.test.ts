import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';

const STORAGE_KEY = 'gutenku-openai-key';
const VALID_KEY = `sk-${'a'.repeat(24)}`;

async function load() {
  vi.resetModules();

  return import('@/core/composables/openai-key');
}

describe('openai-key', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('isPlausibleOpenAIKey', () => {
    it.each([
      VALID_KEY,
      `sk-proj-${'A1_-'.repeat(8)}`,
      `sk-svcacct-${'b'.repeat(30)}`,
      `sk-${'x'.repeat(256)}`,
    ])('accepts %s', async (key) => {
      const { isPlausibleOpenAIKey } = await load();

      expect(isPlausibleOpenAIKey(key)).toBeTruthy();
    });

    it.each([
      '',
      'sk-',
      'sk-short',
      `pk-${'a'.repeat(24)}`,
      `sk-${'a'.repeat(257)}`,
      `sk-${'a'.repeat(24)} `,
      ` sk-${'a'.repeat(24)}`,
      `sk-${'a'.repeat(19)}!`,
    ])('rejects %j', async (key) => {
      const { isPlausibleOpenAIKey } = await load();

      expect(isPlausibleOpenAIKey(key)).toBeFalsy();
    });
  });

  describe('useOpenAIKey', () => {
    it('starts empty with no mask', async () => {
      const { useOpenAIKey } = await load();
      const { key, hasKey, maskedKey } = useOpenAIKey();

      expect(key.value).toBe('');
      expect(hasKey.value).toBeFalsy();
      expect(maskedKey.value).toBe('');
    });

    it('reads a key already stored in this browser', async () => {
      localStorage.setItem(STORAGE_KEY, VALID_KEY);
      const { useOpenAIKey } = await load();
      const { key, hasKey } = useOpenAIKey();

      expect(key.value).toBe(VALID_KEY);
      expect(hasKey.value).toBeTruthy();
    });

    it('saves a trimmed key and masks all but the last four characters', async () => {
      const { useOpenAIKey } = await load();
      const { key, hasKey, maskedKey, save } = useOpenAIKey();

      save(`  ${VALID_KEY}  `);

      expect(key.value).toBe(VALID_KEY);
      expect(hasKey.value).toBeTruthy();
      expect(maskedKey.value).toBe('sk-…aaaa');
      expect(maskedKey.value).not.toContain(VALID_KEY);
    });

    it('persists to local storage', async () => {
      const { useOpenAIKey } = await load();
      const { save } = useOpenAIKey();

      save(VALID_KEY);
      await nextTick();

      expect(localStorage.getItem(STORAGE_KEY)).toBe(VALID_KEY);
    });

    it('forgets the key', async () => {
      const { useOpenAIKey } = await load();
      const { key, hasKey, maskedKey, save, forget } = useOpenAIKey();

      save(VALID_KEY);
      forget();
      await nextTick();

      expect(key.value).toBe('');
      expect(hasKey.value).toBeFalsy();
      expect(maskedKey.value).toBe('');
      expect(localStorage.getItem(STORAGE_KEY)).toBeFalsy();
    });

    it('shares one ref across callers', async () => {
      const { useOpenAIKey } = await load();
      const first = useOpenAIKey();
      const second = useOpenAIKey();

      expect(second.key).toBe(first.key);

      first.save(VALID_KEY);

      expect(second.key.value).toBe(VALID_KEY);
    });
  });

  describe('getOpenAIKey', () => {
    it('returns an empty string without a key', async () => {
      const { getOpenAIKey } = await load();

      expect(getOpenAIKey()).toBe('');
    });

    it('follows the saved key without reactivity', async () => {
      const { getOpenAIKey, useOpenAIKey } = await load();
      const { save, forget } = useOpenAIKey();

      save(VALID_KEY);

      expect(getOpenAIKey()).toBe(VALID_KEY);

      forget();

      expect(getOpenAIKey()).toBe('');
    });
  });

  describe('on the server (SSR)', () => {
    beforeEach(() => {
      vi.stubEnv('SSR', true);
    });

    it('never reads a stored key', async () => {
      localStorage.setItem(STORAGE_KEY, VALID_KEY);
      const { getOpenAIKey, useOpenAIKey } = await load();

      expect(getOpenAIKey()).toBe('');
      expect(useOpenAIKey().hasKey.value).toBeFalsy();
    });

    it('gives each caller its own throwaway ref', async () => {
      const { useOpenAIKey } = await load();
      const first = useOpenAIKey();
      const second = useOpenAIKey();

      first.save(VALID_KEY);

      expect(first.key.value).toBe(VALID_KEY);
      expect(second.key.value).toBe('');
      expect(localStorage.getItem(STORAGE_KEY)).toBeFalsy();
    });
  });
});
