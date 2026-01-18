import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useTextCompacting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be importable', async () => {
    const module = await import(
      '@/features/haiku/composables/text-compacting'
    );
    expect(module.useTextCompacting).toBeDefined();
  });

  it('should expose compactText, splitIntoSentences, and ensurePunctuation', async () => {
    const { useTextCompacting } = await import(
      '@/features/haiku/composables/text-compacting'
    );

    const result = useTextCompacting();

    expect(typeof result.compactText).toBe('function');
    expect(typeof result.splitIntoSentences).toBe('function');
    expect(typeof result.ensurePunctuation).toBe('function');
  });

  it('should split text into sentences', async () => {
    const { useTextCompacting } = await import(
      '@/features/haiku/composables/text-compacting'
    );

    const { splitIntoSentences } = useTextCompacting();

    const text = 'First sentence. Second sentence! Third sentence?';
    const sentences = splitIntoSentences(text);

    expect(sentences).toHaveLength(3);
    expect(sentences[0]).toBe('First sentence.');
    expect(sentences[1]).toBe('Second sentence!');
    expect(sentences[2]).toBe('Third sentence?');
  });

  it('should ensure punctuation at end of text', async () => {
    const { useTextCompacting } = await import(
      '@/features/haiku/composables/text-compacting'
    );

    const { ensurePunctuation } = useTextCompacting();

    expect(ensurePunctuation('No punctuation')).toBe('No punctuation.');
    expect(ensurePunctuation('Has period.')).toBe('Has period.');
    expect(ensurePunctuation('Has exclamation!')).toBe('Has exclamation!');
    expect(ensurePunctuation('Has question?')).toBe('Has question?');
  });

  it('should compact text based on verses', async () => {
    const { useTextCompacting } = await import(
      '@/features/haiku/composables/text-compacting'
    );

    const { compactText } = useTextCompacting();

    const content = 'First sentence. Second sentence. Third sentence.';
    const verses = ['Second'];

    const result = compactText(content, verses);

    expect(result).toContain('Second sentence');
  });

  it('should return empty string for empty input', async () => {
    const { useTextCompacting } = await import(
      '@/features/haiku/composables/text-compacting'
    );

    const { compactText } = useTextCompacting();

    expect(compactText('', [])).toBe('');
    expect(compactText('Some text', [])).toBe('');
  });

  it('should accept options', async () => {
    const { useTextCompacting } = await import(
      '@/features/haiku/composables/text-compacting'
    );

    expect(() =>
      useTextCompacting({
        includePrevSentence: false,
        includeNextSentence: false,
        sectionSeparator: ' | ',
      }),
    ).not.toThrow();
  });
});
