import { describe, expect, it } from 'vitest';
import { useBookRedaction } from '@/features/haiku/composables/book-redaction';

describe('useBookRedaction', () => {
  it('hides the book again for the next haiku', () => {
    const { redacted, reveal, hideAgain } = useBookRedaction();

    reveal();
    expect(redacted.value).toBeFalsy();
    hideAgain();
    expect(redacted.value).toBeTruthy();
  });
});
