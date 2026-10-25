import {
  buildVerseExcerpt,
  type VerseExcerpt,
} from '~/domain/services/verse-excerpt';

interface ExcerptSource {
  verses: readonly string[];
  rawVerses?: readonly string[];
  chapterId?: string;
}

/**
 * The day's verses in a few words of their chapter. Decoration for the home
 * page: any failure gives null, never an error on the day's haiku.
 */
export async function loadDailyExcerpt(
  record: ExcerptSource,
  getChapter: (id: string) => Promise<{ content: string } | null>,
): Promise<VerseExcerpt | null> {
  if (!record.chapterId) {
    return null;
  }

  try {
    const chapter = await getChapter(record.chapterId);

    return chapter
      ? buildVerseExcerpt(
          chapter.content,
          record.rawVerses?.length ? record.rawVerses : record.verses,
        )
      : null;
  } catch {
    return null;
  }
}
