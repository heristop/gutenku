import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useTextCompacting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be importable', async () => {
    const module = await import('@/features/haiku/composables/text-compacting');
    expect(module.useTextCompacting).toBeDefined();
  });

  it('should expose compactText, splitIntoSentences, and ensurePunctuation', async () => {
    const { useTextCompacting } =
      await import('@/features/haiku/composables/text-compacting');

    const result = useTextCompacting();

    expect(typeof result.compactText).toBe('function');
    expect(typeof result.splitIntoSentences).toBe('function');
    expect(typeof result.ensurePunctuation).toBe('function');
  });

  it('should split text into sentences', async () => {
    const { useTextCompacting } =
      await import('@/features/haiku/composables/text-compacting');

    const { splitIntoSentences } = useTextCompacting();

    const text = 'First sentence. Second sentence! Third sentence?';
    const sentences = splitIntoSentences(text);

    expect(sentences).toHaveLength(3);
    expect(sentences[0]).toBe('First sentence.');
    expect(sentences[1]).toBe('Second sentence!');
    expect(sentences[2]).toBe('Third sentence?');
  });

  it('should ensure punctuation at end of text', async () => {
    const { useTextCompacting } =
      await import('@/features/haiku/composables/text-compacting');

    const { ensurePunctuation } = useTextCompacting();

    expect(ensurePunctuation('No punctuation')).toBe('No punctuation.');
    expect(ensurePunctuation('Has period.')).toBe('Has period.');
    expect(ensurePunctuation('Has exclamation!')).toBe('Has exclamation!');
    expect(ensurePunctuation('Has question?')).toBe('Has question?');
  });

  it('should compact text based on verses', async () => {
    const { useTextCompacting } =
      await import('@/features/haiku/composables/text-compacting');

    const { compactText } = useTextCompacting();

    const content = 'First sentence. Second sentence. Third sentence.';
    const verses = ['Second'];

    const result = compactText(content, verses);

    expect(result).toContain('Second sentence');
  });

  it('should return empty string for empty input', async () => {
    const { useTextCompacting } =
      await import('@/features/haiku/composables/text-compacting');

    const { compactText } = useTextCompacting();

    expect(compactText('', [])).toBe('');
    expect(compactText('Some text', [])).toBe('');
  });

  it('should accept options', async () => {
    const { useTextCompacting } =
      await import('@/features/haiku/composables/text-compacting');

    expect(() =>
      useTextCompacting({
        includePrevSentence: false,
        includeNextSentence: false,
        sectionSeparator: ' | ',
      }),
    ).not.toThrow();
  });

  it('should include prev and next sentences around the matched verse', async () => {
    const { useTextCompacting } =
      await import('@/features/haiku/composables/text-compacting');

    const { compactText } = useTextCompacting();
    const content =
      'The first sentence. A quiet pond reflects. The third sentence here. A fourth one.';
    const result = compactText(content, ['A quiet pond reflects']);

    expect(result).toContain('The first sentence.');
    expect(result).toContain('A quiet pond reflects.');
    expect(result).toContain('The third sentence here.');
  });

  it('should only include the verse sentence when surrounding context is disabled', async () => {
    const { useTextCompacting } =
      await import('@/features/haiku/composables/text-compacting');

    const { compactText } = useTextCompacting({
      includePrevSentence: false,
      includeNextSentence: false,
    });
    const result = compactText('Before. The verse here. After.', [
      'The verse here',
    ]);

    expect(result).toBe('The verse here.');
  });

  it('should not reuse the same sentence for two identical verses', async () => {
    const { useTextCompacting } =
      await import('@/features/haiku/composables/text-compacting');

    const { compactText } = useTextCompacting({
      includePrevSentence: false,
      includeNextSentence: false,
    });
    const result = compactText('Alpha word. Beta word. Gamma word.', [
      'word',
      'word',
    ]);
    const sections = result.split('\n\n');

    expect(sections).toHaveLength(2);
    expect(sections[0]).not.toBe(sections[1]);
  });

  it('should join sections using the configured separator', async () => {
    const { useTextCompacting } =
      await import('@/features/haiku/composables/text-compacting');

    const { compactText } = useTextCompacting({
      includePrevSentence: false,
      includeNextSentence: false,
      sectionSeparator: ' || ',
    });
    const result = compactText('Alpha here. Beta here. Gamma here.', [
      'Alpha here',
      'Gamma here',
    ]);

    expect(result).toBe('Alpha here. || Gamma here.');
  });

  it('should use fallback context extraction for verses spanning sentence boundaries', async () => {
    const { useTextCompacting } =
      await import('@/features/haiku/composables/text-compacting');

    const { compactText } = useTextCompacting();
    const content =
      'Padding words here before the part. After it more padding words here too.';
    const result = compactText(content, ['the part. After it']);

    expect(result).toContain('the part. After it');
    expect(/[.!?]$/.test(result)).toBeTruthy();
  });
});
