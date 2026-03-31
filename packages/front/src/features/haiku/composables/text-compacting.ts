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
    const usedSentenceIndices = new Set<number>();
    let fallbackSearchStart = 0;

    verses.forEach((verse) => {
      // Find the FIRST unused sentence containing this verse
      const verseSentenceIndex = sentences.findIndex(
        (sentence, idx) =>
          !usedSentenceIndices.has(idx) && sentence.includes(verse.trim()),
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
        usedSentenceIndices.add(verseSentenceIndex);
        if (prevSentence) {usedSentenceIndices.add(verseSentenceIndex - 1);}
        if (nextSentence) {usedSentenceIndices.add(verseSentenceIndex + 1);}
      } else {
        // Fallback: verse spans a sentence boundary or regex failed
        const trimmedVerse = verse.trim();
        const verseIdx = content.indexOf(trimmedVerse, fallbackSearchStart);
        if (verseIdx !== -1) {
          const ctxStart = Math.max(0, verseIdx - 100);
          const ctxEnd = Math.min(
            content.length,
            verseIdx + trimmedVerse.length + 100,
          );
          const before = content
            .slice(ctxStart, verseIdx)
            .replace(/^\S*\s/, '');
          const after = content
            .slice(verseIdx + trimmedVerse.length, ctxEnd)
            .replace(/\s\S*$/, '');
          compactedSections.push(
            ensurePunctuation((before + trimmedVerse + after).trim()),
          );
          fallbackSearchStart = verseIdx + trimmedVerse.length;
        }
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
