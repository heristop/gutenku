import { computed, ref, type Ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';

// A visitor's own OpenAI key. It lives in this browser's local storage and
// goes out only with the visitor's own requests, so the server can call
// OpenAI on their behalf; the server never keeps it.
const STORAGE_KEY = 'gutenku-openai-key';

// Same shape the server accepts: sk-…, sk-proj-…, sk-svcacct-…
const OPENAI_KEY_PATTERN = /^sk-[\w-]{20,256}$/;

let storedKey: Ref<string> | null = null;

// One shared ref for the app; SSR renders without a key
function keyRef(): Ref<string> {
  if (import.meta.env.SSR) {
    return ref('');
  }

  storedKey ??= useLocalStorage(STORAGE_KEY, '');

  return storedKey;
}

export function isPlausibleOpenAIKey(key: string): boolean {
  return OPENAI_KEY_PATTERN.test(key);
}

// Read without reactivity, for request headers
export function getOpenAIKey(): string {
  return keyRef().value;
}

export function useOpenAIKey() {
  const key = keyRef();
  const hasKey = computed(() => key.value !== '');
  // Enough to recognise it, never enough to reuse it
  const maskedKey = computed(() =>
    hasKey.value ? `sk-…${key.value.slice(-4)}` : '',
  );

  function save(value: string): void {
    key.value = value.trim();
  }

  function forget(): void {
    key.value = '';
  }

  return { key, hasKey, maskedKey, save, forget };
}
