import type { ContextVerses } from '~/shared/types';

// Pre-compiled regex for sentence splitting
const SENTENCE_SPLIT_REGEX = /(?<=[.,;!?])\s+/;

export function findContext(
  text: string,
  substring: string,
  numWords = 5,
  numSentences = 2,
  preSplitSentences?: string[],
) {
  const sentences = preSplitSentences ?? text.split(SENTENCE_SPLIT_REGEX);

  const index = text.indexOf(substring);

  if (index === -1) {
    return null;
  }

  const wordsBeforeArray = text.slice(0, index).split(' ').slice(-numWords);
  const wordsAfterArray = text
    .slice(index + substring.length)
    .split(' ')
    .slice(0, numWords);
  const wordsBefore = wordsBeforeArray.join(' ');
  const wordsAfter = wordsAfterArray.join(' ');

  const sentenceIndexBefore = sentences.findIndex((sentence) =>
    sentence.includes(wordsBeforeArray[0]),
  );
  const sentenceIndexAfter = sentences.findIndex((sentence) =>
    sentence.includes(wordsAfterArray.at(-1)),
  );

  const sentencesBefore = sentences.slice(
    Math.max(0, sentenceIndexBefore - numSentences + 1),
    sentenceIndexBefore + 1,
  );
  const sentencesAfter = sentences.slice(
    sentenceIndexAfter,
    sentenceIndexAfter + numSentences,
  );
  const sentenceBefore = sentencesBefore
    .join(' ')
    .replace(substring, '')
    .trim();
  const sentenceAfter = sentencesAfter.join(' ').replace(substring, '').trim();

  return {
    sentenceAfter,
    sentenceBefore,
    wordsAfter,
    wordsBefore,
  };
}

export function extractContextVerses(
  verses: string[],
  chapter: string,
): ContextVerses[] {
  // Clean chapter and split sentences once before the loop
  const cleanedChapter = chapter.replaceAll('\n', ' ');
  const sentences = cleanedChapter.split(SENTENCE_SPLIT_REGEX);

  return verses.map((verse) =>
    findContext(cleanedChapter, verse.replaceAll('\n', ' '), 5, 2, sentences),
  );
}

export function cleanVerses(verses: string[]): string[] {
  const newLineRegex = /[\n\r]/g;
  const whitespaceRegex = /\s+/g;

  return verses.map((verse) => {
    verse = verse
      .trim()
      .replaceAll(newLineRegex, ' ')
      .replaceAll(whitespaceRegex, ' ')
      .replaceAll(/^['"""]|['"""]$|\.\.\.$|\.$\.$|\.$|,$|!$|;$|\?$/g, '');

    return verse.charAt(0).toUpperCase() + verse.slice(1);
  });
}

export function capitalizeVerse(verse: string): string {
  const trimmed = verse.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
