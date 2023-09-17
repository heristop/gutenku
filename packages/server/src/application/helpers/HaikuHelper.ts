import { ContextVerses } from '../../types';

export default class HaikuHelper {
    static extractContextVerses(
        verses: string[],
        chapter: string
    ): ContextVerses[] {
        return verses.map(verse => {
            return HaikuHelper.findContext(
                chapter.replaceAll(/\n/g, ' '),
                verse.replaceAll(/\n/g, ' ')
            );
        });
    }

    static findContext(text: string, substring: string, numWords: number = 5, numSentences: number = 2) {
        const sentences = text.split(/(?<=[.,;!?])\s+/);

        const index = text.indexOf(substring);

        if (index === -1) {
            return null;
        }

        const wordsBeforeArray = text.slice(0, index).split(" ").slice(-numWords);
        const wordsAfterArray = text.slice(index + substring.length).split(" ").slice(0, numWords);
        const wordsBefore = wordsBeforeArray.join(" ");
        const wordsAfter = wordsAfterArray.join(" ");

        const sentenceIndexBefore = sentences.findIndex(sentence => sentence.includes(wordsBeforeArray[0]));
        const sentenceIndexAfter = sentences.findIndex(sentence => sentence.includes(wordsAfterArray[wordsAfterArray.length - 1]));

        const sentencesBefore = sentences.slice(Math.max(0, sentenceIndexBefore - numSentences + 1), sentenceIndexBefore + 1);
        const sentencesAfter = sentences.slice(sentenceIndexAfter, sentenceIndexAfter + numSentences);
        const sentenceBefore = sentencesBefore.join(" ").replace(substring, "").trim();
        const sentenceAfter = sentencesAfter.join(" ").replace(substring, "").trim();

        return {
            wordsBefore,
            sentenceBefore,
            wordsAfter,
            sentenceAfter
        };
    }

    static clean(verses: string[]): string[] {
        const newLineRegex = /[\n\r]/g;
        const whitespaceRegex = /\s+/g;

        return verses.map(verse => {
            verse = verse.trim()
                .replaceAll(newLineRegex, ' ')
                .replaceAll(whitespaceRegex, ' ')
                .replaceAll(/^'|'$|\.\.\.$|\.$\.$|\.$|,$|!$|;$|\?$/g, '');

            return verse.charAt(0).toUpperCase() + verse.slice(1);
        });
    }
}
