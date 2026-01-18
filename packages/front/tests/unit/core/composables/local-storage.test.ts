import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExpandedState } from '@/core/composables/local-storage';

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
  useLocalStorage: vi.fn((key: string, defaultValue: boolean) => {
    const storage: Record<string, boolean> = {};
    return {
      get value() {
        return storage[key] ?? defaultValue;
      },
      set value(val: boolean) {
        storage[key] = val;
      },
    };
  }),
}));

describe('useExpandedState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default value of true', () => {
    const { value } = useExpandedState('test-key');
    expect(value.value).toBeTruthy();
  });

  it('should use custom default value', () => {
    const { value } = useExpandedState('test-key', false);
    expect(value.value).toBeFalsy();
  });

  it('should toggle value', () => {
    const { value, toggle } = useExpandedState('test-key', true);

    expect(value.value).toBeTruthy();

    toggle();
    expect(value.value).toBeFalsy();

    toggle();
    expect(value.value).toBeTruthy();
  });

  it('should provide toggle function', () => {
    const { toggle } = useExpandedState('test-key');
    expect(typeof toggle).toBe('function');
  });
});
