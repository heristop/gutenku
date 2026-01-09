import { SyllableCount } from './SyllableCount';
import {
  InvalidVerseException,
  InvalidSyllableCountException,
  BlacklistedCharacterException,
} from '~/domain/exceptions';
import {
  BLACKLISTED_CHARS_PATTERN,
  INVALID_START_WORDS_PATTERN,
  INVALID_END_WORDS_PATTERN,
  UPPERCASE_TEXT_PATTERN,
  LOST_LETTER_PATTERN,
  CONJUNCTION_START_PATTERN,
} from '~/shared/constants/validation';

export interface VerseProps {
  readonly text: string;
  readonly expectedSyllables: number;
  readonly isFirstVerse?: boolean;
}

export class Verse {
  private static readonly MAX_LENGTH = 30;

  private readonly _text: string;
  private readonly _syllableCount: SyllableCount;
  private readonly _cleanedText: string;

  private constructor(
    text: string,
    syllableCount: SyllableCount,
    cleanedText: string,
  ) {
    this._text = text;
    this._syllableCount = syllableCount;
    this._cleanedText = cleanedText;
    Object.freeze(this);
  }

  get text(): string {
    return this._text;
  }

  get cleanedText(): string {
    return this._cleanedText;
  }

  get syllableCount(): SyllableCount {
    return this._syllableCount;
  }

  static create(props: VerseProps): Verse {
    const { text, expectedSyllables, isFirstVerse = false } = props;

    const normalizedText = text.replaceAll('\n', ' ').trim();

    if (this.hasBlacklistedChars(normalizedText)) {
      throw new BlacklistedCharacterException(normalizedText);
    }

    if (UPPERCASE_TEXT_PATTERN.test(normalizedText)) {
      throw new InvalidVerseException(normalizedText, {
        reason: 'uppercase',
      });
    }

    if (INVALID_START_WORDS_PATTERN.test(normalizedText)) {
      throw new InvalidVerseException(normalizedText, {
        reason: 'invalid_start_word',
      });
    }

    if (INVALID_END_WORDS_PATTERN.test(normalizedText)) {
      throw new InvalidVerseException(normalizedText, {
        reason: 'invalid_end_word',
      });
    }

    if (LOST_LETTER_PATTERN.test(normalizedText)) {
      throw new InvalidVerseException(normalizedText, {
        reason: 'lost_letter',
      });
    }

    if (normalizedText.length >= Verse.MAX_LENGTH) {
      throw new InvalidVerseException(normalizedText, {
        reason: 'length',
      });
    }

    if (isFirstVerse && CONJUNCTION_START_PATTERN.test(normalizedText)) {
      throw new InvalidVerseException(normalizedText, {
        reason: 'conjunction_start',
      });
    }

    const syllableCount = SyllableCount.fromText(normalizedText);
    if (!syllableCount.isValidFor(expectedSyllables)) {
      throw new InvalidSyllableCountException(
        expectedSyllables,
        syllableCount.value,
        normalizedText,
      );
    }

    const cleanedText = this.cleanText(normalizedText);

    return new Verse(normalizedText, syllableCount, cleanedText);
  }

  private static hasBlacklistedChars(text: string): boolean {
    return BLACKLISTED_CHARS_PATTERN.test(text);
  }

  private static cleanText(text: string): string {
    let cleaned = text
      .trim()
      .replaceAll(/[\n\r]/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .replaceAll(/^'|'$|\.\.\.$|\.$\.$|\.$|,$|!$|;$|\?$/g, '');

    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  equals(other: Verse): boolean {
    return this._text === other._text;
  }

  toDTO(): string {
    return this._cleanedText;
  }
}
