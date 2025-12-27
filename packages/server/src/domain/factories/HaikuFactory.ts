import { Book } from '~/domain/value-objects/Book';
import { Chapter } from '~/domain/value-objects/Chapter';
import { HaikuAggregate } from '~/domain/aggregates/HaikuAggregate';
import type {
  BookValue,
  ChapterValue,
  HaikuValue,
  ContextVerses,
} from '@gutenku/shared';

export interface CreateHaikuInput {
  book: BookValue;
  chapter: ChapterValue;
  rawVerses: string[];
  context?: ContextVerses[];
  cacheUsed: boolean;
  executionTime?: number;
}

export const HaikuFactory = {
  create(input: CreateHaikuInput): HaikuAggregate {
    const book = Book.fromDTO(input.book);
    const chapter = Chapter.fromDTO(input.chapter);

    return HaikuAggregate.fromRawVerses(book, chapter, input.rawVerses, {
      context: input.context,
      cacheUsed: input.cacheUsed,
      executionTime: input.executionTime,
    });
  },

  fromDTO(dto: HaikuValue): HaikuAggregate {
    return this.create({
      book: dto.book,
      chapter: dto.chapter,
      rawVerses: dto.rawVerses,
      context: dto.context,
      cacheUsed: dto.cacheUsed,
      executionTime: dto.executionTime,
    });
  },
};
