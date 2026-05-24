import { describe, it, expect } from 'vitest';
import { createApp } from 'vue';
import { defineStore } from 'pinia';
import pinia from '@/store/index';

describe('pinia store instance', () => {
  it('exports a configured pinia instance with install hook', () => {
    expect(pinia).toBeDefined();
    expect(typeof pinia.install).toBe('function');
    expect(typeof pinia.use).toBe('function');
  });

  it('can be installed into an app and back a store', () => {
    const app = createApp({ render: () => null });
    app.use(pinia);

    const useTestStore = defineStore('test-store-index', {
      state: () => ({ value: 1 }),
    });
    const store = useTestStore(pinia);

    expect(store.value).toBe(1);
    store.value = 2;
    expect(store.value).toBe(2);
  });
});
