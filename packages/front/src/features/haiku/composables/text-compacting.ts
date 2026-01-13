export interface CompactingOptions {
  includePrevSentence?: boolean;
  includeNextSentence?: boolean;
  sectionSeparator?: string;
}

export function useTextCompacting(options: CompactingOptions = {}) {
  const {
    includePrevSentence = true,
    includeNextSentence = true,
    sectionSeparator = '\n\n',
  } = options;

  const splitIntoSentences = (text: string): string[] => {
    return text
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => sentence.trim().length > 0);
  };

  const ensurePunctuation = (text: string): string => {
    return /[.!?]$/.test(text) ? text : text + '.';
  };

  const compactText = (content: string, verses: string[]): string => {
    if (!content || !verses || verses.length === 0) {
      return '';
    }

    const sentences = splitIntoSentences(content);
    const compactedSections: string[] = [];

    verses.forEach((verse) => {
      // Find the sentence containing this verse
      const verseSentenceIndex = sentences.findIndex((sentence) =>
        sentence.includes(verse.trim()),
      );

      if (verseSentenceIndex !== -1) {
        // Get surrounding sentences
        const prevSentence =
          includePrevSentence && verseSentenceIndex > 0
            ? sentences[verseSentenceIndex - 1].trim()
            : '';
        const verseSentence = sentences[verseSentenceIndex].trim();
        const nextSentence =
          includeNextSentence && verseSentenceIndex < sentences.length - 1
            ? sentences[verseSentenceIndex + 1].trim()
            : '';

        // Create compacted section with proper punctuation
        let section = '';

        if (prevSentence) {
          section += ensurePunctuation(prevSentence) + ' ';
        }

        section += ensurePunctuation(verseSentence);

        if (nextSentence) {
          section += ' ' + ensurePunctuation(nextSentence);
        }

        compactedSections.push(section);
      }
    });

    return compactedSections.join(sectionSeparator);
  };

  return {
    compactText,
    splitIntoSentences,
    ensurePunctuation,
  };
}
