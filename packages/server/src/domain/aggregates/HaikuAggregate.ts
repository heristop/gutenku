import type { Book } from '~/domain/value-objects/Book';
import type { Chapter } from '~/domain/value-objects/Chapter';
import { Verse } from '~/domain/value-objects/Verse';
import { InvalidVerseCountException } from '~/domain/exceptions';
import type { HaikuValue, ContextVerses, Translations } from '@gutenku/shared';

export interface HaikuProps {
  readonly book: Book;
  readonly chapter: Chapter;
  readonly verses: Verse[];
  readonly rawVerses: string[];
  readonly context?: ContextVerses[];
  readonly image?: string;
  readonly imagePath?: string;
  readonly title?: string;
  readonly description?: string;
  readonly hashtags?: string;
  readonly translations?: Translations;
  readonly cacheUsed: boolean;
  readonly executionTime?: number;
}

export class HaikuAggregate {
  private static readonly EXPECTED_VERSE_COUNT = 3;
  private static readonly SYLLABLE_PATTERN: readonly number[] = [
    5, 7, 5,
  ] as const;

  private readonly _book: Book;
  private readonly _chapter: Chapter;
  private readonly _verses: readonly Verse[];
  private readonly _rawVerses: readonly string[];
  private readonly _context?: ContextVerses[];
  private readonly _image?: string;
  private readonly _imagePath?: string;
  private readonly _title?: string;
  private readonly _description?: string;
  private readonly _hashtags?: string;
  private readonly _translations?: Translations;
  private readonly _cacheUsed: boolean;
  private readonly _executionTime?: number;

  private constructor(props: HaikuProps) {
    this._book = props.book;
    this._chapter = props.chapter;
    this._verses = Object.freeze([...props.verses]);
    this._rawVerses = Object.freeze([...props.rawVerses]);
    this._context = props.context;
    this._image = props.image;
    this._imagePath = props.imagePath;
    this._title = props.title;
    this._description = props.description;
    this._hashtags = props.hashtags;
    this._translations = props.translations;
    this._cacheUsed = props.cacheUsed;
    this._executionTime = props.executionTime;
    Object.freeze(this);
  }

  get book(): Book {
    return this._book;
  }
  get chapter(): Chapter {
    return this._chapter;
  }
  get verses(): readonly Verse[] {
    return this._verses;
  }
  get rawVerses(): readonly string[] {
    return this._rawVerses;
  }
  get context(): ContextVerses[] | undefined {
    return this._context;
  }
  get image(): string | undefined {
    return this._image;
  }
  get imagePath(): string | undefined {
    return this._imagePath;
  }
  get title(): string | undefined {
    return this._title;
  }
  get description(): string | undefined {
    return this._description;
  }
  get hashtags(): string | undefined {
    return this._hashtags;
  }
  get translations(): Translations | undefined {
    return this._translations;
  }
  get cacheUsed(): boolean {
    return this._cacheUsed;
  }
  get executionTime(): number | undefined {
    return this._executionTime;
  }

  static create(props: HaikuProps): HaikuAggregate {
    if (props.verses.length !== this.EXPECTED_VERSE_COUNT) {
      throw new InvalidVerseCountException(
        this.EXPECTED_VERSE_COUNT,
        props.verses.length,
      );
    }

    return new HaikuAggregate(props);
  }

  static fromRawVerses(
    book: Book,
    chapter: Chapter,
    rawVerses: string[],
    options: {
      context?: ContextVerses[];
      cacheUsed: boolean;
      executionTime?: number;
    },
  ): HaikuAggregate {
    if (rawVerses.length !== this.EXPECTED_VERSE_COUNT) {
      throw new InvalidVerseCountException(
        this.EXPECTED_VERSE_COUNT,
        rawVerses.length,
      );
    }

    const verses = rawVerses.map((text, index) =>
      Verse.create({
        text,
        expectedSyllables: this.SYLLABLE_PATTERN[index],
        isFirstVerse: index === 0,
      }),
    );

    return new HaikuAggregate({
      book,
      chapter,
      verses,
      rawVerses,
      context: options.context,
      cacheUsed: options.cacheUsed,
      executionTime: options.executionTime,
    });
  }

  withImage(image: string, imagePath?: string): HaikuAggregate {
    return new HaikuAggregate({
      book: this._book,
      chapter: this._chapter,
      verses: [...this._verses],
      rawVerses: [...this._rawVerses],
      context: this._context,
      image,
      imagePath,
      title: this._title,
      description: this._description,
      hashtags: this._hashtags,
      translations: this._translations,
      cacheUsed: this._cacheUsed,
      executionTime: this._executionTime,
    });
  }

  withMetadata(metadata: {
    title?: string;
    description?: string;
    hashtags?: string;
    translations?: Translations;
  }): HaikuAggregate {
    return new HaikuAggregate({
      book: this._book,
      chapter: this._chapter,
      verses: [...this._verses],
      rawVerses: [...this._rawVerses],
      context: this._context,
      image: this._image,
      imagePath: this._imagePath,
      title: metadata.title ?? this._title,
      description: metadata.description ?? this._description,
      hashtags: metadata.hashtags ?? this._hashtags,
      translations: metadata.translations ?? this._translations,
      cacheUsed: this._cacheUsed,
      executionTime: this._executionTime,
    });
  }

  toDTO(): HaikuValue {
    return {
      book: this._book.toDTO(),
      chapter: this._chapter.toDTO(),
      verses: this._verses.map((v) => v.toDTO()),
      rawVerses: [...this._rawVerses],
      context: this._context,
      image: this._image,
      imagePath: this._imagePath,
      title: this._title,
      description: this._description,
      hashtags: this._hashtags,
      translations: this._translations,
      cacheUsed: this._cacheUsed,
      executionTime: this._executionTime,
    };
  }

  static getSyllablePattern(): readonly number[] {
    return this.SYLLABLE_PATTERN;
  }
}
