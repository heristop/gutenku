import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import {
  buildDailyHaikuEntity,
  publicationDateForPost,
} from '~/cli/daily-haiku-publisher';

describe('buildDailyHaikuEntity', () => {
  const card = Buffer.from('jpeg');

  it('uses the publication date (10:00 UTC rollover) as the date', () => {
    const entity = buildDailyHaikuEntity({
      haiku: {
        verses: ['a', 'b', 'c'],
        title: 'T',
        description: 'R',
        book: {
          title: 'Walden',
          author: 'Thoreau',
          reference: '205',
          emoticons: '🌲',
        },
        chapter: { title: 'Solitude', content: 'long text' },
      },
      card,
      socialCaption: 'caption',
      now: new Date('2026-10-24T07:30:00-03:00'),
    });

    expect(entity).toEqual({
      date: '2026-10-24',
      publishedAt: new Date('2026-10-24T10:30:00.000Z'),
      verses: ['a', 'b', 'c'],
      title: 'T',
      description: 'R',
      book: {
        title: 'Walden',
        author: 'Thoreau',
        reference: '205',
        emoticons: '🌲',
      },
      chapter: { title: 'Solitude' },
      card: { contentType: 'image/jpeg', data: card },
      socialCaption: 'caption',
      source: 'cli',
    });
  });

  it('keeps where the verses were cut from, for the home blackout', () => {
    const entity = buildDailyHaikuEntity({
      haiku: {
        verses: ['The night', 'b', 'c'],
        rawVerses: ['the night', 'b', 'c'],
        book: { title: 'W', author: 'T' },
        chapter: {
          _id: '68c701011a684efaf0205a60',
          title: 'One',
          content: 'x',
        },
      } as never,
      card,
      now: new Date('2026-10-24T12:00:00.000Z'),
    });

    expect(entity.chapterId).toBe('68c701011a684efaf0205a60');
    expect(entity.rawVerses).toEqual(['the night', 'b', 'c']);
  });

  it('belongs to the previous day before the rollover', () => {
    const entity = buildDailyHaikuEntity({
      haiku: { verses: ['a', 'b', 'c'], book: { title: 'W', author: 'T' } },
      card,
      now: new Date('2026-10-24T02:30:00.000Z'),
    });

    expect(entity.date).toBe('2026-10-23');
  });

  it('records the given source', () => {
    const entity = buildDailyHaikuEntity({
      haiku: { verses: ['a', 'b', 'c'], book: { title: 'W', author: 'T' } },
      card,
      source: 'seed',
    });

    expect(entity.source).toBe('seed');
  });

  it('omits missing optional fields instead of storing nulls', () => {
    const entity = buildDailyHaikuEntity({
      haiku: {
        verses: ['a', 'b', 'c'],
        book: { title: 'Walden', author: 'Thoreau' },
      },
      card,
      now: new Date('2026-10-23T10:00:00.000Z'),
    });

    expect(Object.keys(entity).toSorted()).toEqual(
      ['book', 'card', 'date', 'publishedAt', 'source', 'verses'].toSorted(),
    );
    expect(entity.book).toEqual({ title: 'Walden', author: 'Thoreau' });
  });
});

describe('publicationDateForPost', () => {
  it.each([
    ['2026-10-24T09:44:59.000Z', '2026-10-23'],
    ['2026-10-24T09:45:00.000Z', '2026-10-24'],
    ['2026-10-24T09:59:30.000Z', '2026-10-24'],
    ['2026-10-24T10:00:30.000Z', '2026-10-24'],
    ['2026-10-24T23:59:59.000Z', '2026-10-24'],
  ])('a post at %s publishes %s', (now, expected) => {
    expect(publicationDateForPost(new Date(now))).toBe(expected);
  });
});
