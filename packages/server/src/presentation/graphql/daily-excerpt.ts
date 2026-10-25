import {
  buildVerseExcerpt,
  type VerseExcerpt,
} from '~/domain/services/verse-excerpt';

interface ExcerptSource {
  verses: readonly string[];
  rawVerses?: readonly string[];
  chapterId?: string;
  book?: { reference?: string };
}

type ChapterText = { content: string };

/**
 * The day's verses in a few words of their chapter. Decoration for the home
 * page: any failure gives null, never an error on the day's haiku.
 */
export async function loadDailyExcerpt(
  record: ExcerptSource,
  getChapter: (id: string) => Promise<ChapterText | null>,
  getBookChapters?: (reference: string) => Promise<readonly ChapterText[]>,
): Promise<VerseExcerpt | null> {
  const verses = record.rawVerses?.length ? record.rawVerses : record.verses;

  try {
    if (record.chapterId) {
      const chapter = await getChapter(record.chapterId);

      return chapter ? buildVerseExcerpt(chapter.content, verses) : null;
    }

    // Days published without their chapter id: the book's chapter that holds
    // every verse
    const reference = record.book?.reference;

    if (!reference || !getBookChapters) {
      return null;
    }

    for (const chapter of await getBookChapters(reference)) {
      const excerpt = buildVerseExcerpt(chapter.content, verses);

      if (excerpt) {
        return excerpt;
      }
    }

    return null;
  } catch {
    return null;
  }
}
