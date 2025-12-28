import { inject, singleton } from 'tsyringe';
import { RawBookText } from '~/domain/value-objects/RawBookText';
import { ParsedBook } from '~/domain/value-objects/ParsedBook';
import { BookMetadataExtractorService } from './BookMetadataExtractorService';
import {
  ChapterSplitterService,
  type ChapterPattern,
} from './ChapterSplitterService';
import {
  ChapterValidatorService,
  type ValidationConfig,
} from './ChapterValidatorService';
import { InsufficientChaptersException } from '~/domain/exceptions/book';

export interface ParsingOptions {
  validation?: Partial<ValidationConfig>;
  throwOnInvalidBook?: boolean;
}

export interface ParsingResult {
  parsedBook: ParsedBook | null;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  patternUsed: ChapterPattern | null;
  stats: {
    rawChapterCount: number;
    validChapterCount: number;
    rejectedChapterCount: number;
  };
}

@singleton()
export class BookParserService {
  constructor(
    @inject(BookMetadataExtractorService)
    private readonly metadataExtractor: BookMetadataExtractorService,
    @inject(ChapterSplitterService)
    private readonly chapterSplitter: ChapterSplitterService,
    @inject(ChapterValidatorService)
    private readonly chapterValidator: ChapterValidatorService,
  ) {}

  parse(rawText: RawBookText, options?: ParsingOptions): ParsingResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const metadata = this.metadataExtractor.tryExtract(rawText);
    if (!metadata.title) {
      errors.push(`Failed to extract title from book ${rawText.gutenbergId}`);
    }
    if (!metadata.author) {
      errors.push(`Failed to extract author from book ${rawText.gutenbergId}`);
    }

    if (errors.length > 0) {
      return {
        parsedBook: null,
        isValid: false,
        errors,
        warnings,
        patternUsed: null,
        stats: {
          rawChapterCount: 0,
          validChapterCount: 0,
          rejectedChapterCount: 0,
        },
      };
    }

    const splitResult = this.chapterSplitter.split(rawText);

    if (!splitResult.patternUsed) {
      warnings.push(
        'No chapter pattern matched, using entire text as single chapter',
      );
    }

    const validationResult = this.chapterValidator.validate(
      splitResult.chapters,
      options?.validation,
    );

    for (const rejected of validationResult.rejectedChapters) {
      warnings.push(
        `Chapter ${rejected.index} rejected: ${rejected.reasons.join(', ')}`,
      );
    }

    const minChapters =
      options?.validation?.minChapters ??
      ChapterValidatorService.getDefaultConfig().minChapters;

    if (validationResult.validChapters.length < minChapters) {
      errors.push(
        `Insufficient chapters: found ${validationResult.validChapters.length}, required ${minChapters}`,
      );

      if (options?.throwOnInvalidBook) {
        throw new InsufficientChaptersException(
          validationResult.validChapters.length,
          minChapters,
          {
            metadata: {
              gutenbergId: rawText.gutenbergId,
              patternUsed: splitResult.patternUsed?.name,
            },
          },
        );
      }

      return {
        parsedBook: null,
        isValid: false,
        errors,
        warnings,
        patternUsed: splitResult.patternUsed,
        stats: {
          rawChapterCount: splitResult.rawSegmentCount,
          validChapterCount: validationResult.validChapters.length,
          rejectedChapterCount: validationResult.rejectedChapters.length,
        },
      };
    }

    const bookMetadata = this.metadataExtractor.extract(rawText);
    const parsedBook = ParsedBook.create({
      metadata: bookMetadata,
      chapters: validationResult.validChapters,
    });

    // Book is valid if it has at least minChapters (from config or default)
    // This is true since we already checked above and didn't return early
    return {
      parsedBook,
      isValid: true,
      errors,
      warnings,
      patternUsed: splitResult.patternUsed,
      stats: {
        rawChapterCount: splitResult.rawSegmentCount,
        validChapterCount: validationResult.validChapters.length,
        rejectedChapterCount: validationResult.rejectedChapters.length,
      },
    };
  }

  parseContent(
    content: string,
    gutenbergId: number,
    options?: ParsingOptions,
  ): ParsingResult {
    const rawText = RawBookText.create({ content, gutenbergId });
    return this.parse(rawText, options);
  }
}
