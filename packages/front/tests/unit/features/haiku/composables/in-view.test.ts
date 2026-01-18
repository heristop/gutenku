import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

describe('useInView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be importable', async () => {
    const module = await import('@/features/haiku/composables/in-view');
    expect(module.useInView).toBeDefined();
  });

  it('should expose isInView ref', async () => {
    const { useInView } = await import('@/features/haiku/composables/in-view');

    const targetRef = ref(null);
    const { isInView } = useInView(targetRef);

    expect(isInView).toBeDefined();
    expect(typeof isInView.value).toBe('boolean');
  });

  it('should start with isInView as false', async () => {
    const { useInView } = await import('@/features/haiku/composables/in-view');

    const targetRef = ref(null);
    const { isInView } = useInView(targetRef);

    expect(isInView.value).toBe(false);
  });

  it('should accept options', async () => {
    const { useInView } = await import('@/features/haiku/composables/in-view');

    const targetRef = ref(null);

    expect(() =>
      useInView(targetRef, { threshold: 0.5, rootMargin: '10px' }),
    ).not.toThrow();
  });
});
