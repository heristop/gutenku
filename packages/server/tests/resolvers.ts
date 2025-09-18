import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';

vi.mock('tsyringe', async (importOriginal) => {
  const actual = await importOriginal<typeof import('tsyringe')>();

  const makeEmptyAsyncIter = () => ({
    [Symbol.asyncIterator]() {
      return this;
    },
    async next() {
      return { done: true, value: undefined } as IteratorResult<unknown>;
    },
  });

  const pubSubMock = {
    instance: {
      asyncIterator: vi.fn(() => makeEmptyAsyncIter()),
    },
    iterator: vi.fn((_triggers: string | readonly string[]) =>
      makeEmptyAsyncIter(),
    ),
  };

  const bookServiceMock = {
    getAllBooks: vi.fn().mockResolvedValue([]),
    getBookById: vi.fn().mockResolvedValue({ id: '1' }),
  };

  const chapterServiceMock = {
    getAllChapters: vi.fn().mockResolvedValue([]),
    getChapterById: vi.fn().mockResolvedValue({ id: 'c1' }),
  };

  const haikuBridgeServiceMock = {
    generate: vi.fn().mockResolvedValue({ verses: ['a', 'b', 'c'] }),
  };

  const resolve = vi.fn((cls: { name?: string }) => {
    const name = cls?.name;
    switch (name) {
      case 'PubSubService':
        return pubSubMock;
      case 'BookService':
        return bookServiceMock;
      case 'ChapterService':
        return chapterServiceMock;
      case 'HaikuBridgeService':
        return haikuBridgeServiceMock;
      default:
        return {};
    }
  });

  return { ...actual, container: { ...actual.container, resolve } };
});

// Now import resolvers (uses mocked container)
import resolvers from '../src/presentation/graphql/resolvers';

describe('GraphQL resolvers', () => {
  it('books queries resolve via BookService', async () => {
    const result = await resolvers.Query.books(undefined, {
      filter: undefined,
    });
    expect(result).toEqual([]);
    const byId = await resolvers.Query.book(undefined, { id: '1' });
    expect(byId).toEqual({ id: '1' });
  });

  it('chapters queries resolve via ChapterService', async () => {
    const list = await resolvers.Query.chapters(undefined, {
      filter: undefined,
    });
    expect(list).toEqual([]);
    const byId = await resolvers.Query.chapter(undefined, { id: 'c1' });
    expect(byId).toEqual({ id: 'c1' });
  });

  it('haiku query resolves via HaikuBridgeService', async () => {
    const h = await resolvers.Query.haiku(undefined, {
      useAI: false,
      useCache: false,
      appendImg: false,
      selectionCount: 1,
      theme: 'default',
      filter: '',
      sentimentMinScore: 0,
      markovMinScore: 0,
      descriptionTemperature: 0.5,
    });
    expect(h).toEqual({ verses: ['a', 'b', 'c'] });
  });

  it('subscription exposes async iterator', async () => {
    const sub = resolvers.Subscription.quoteGenerated.subscribe();
    expect(typeof sub[Symbol.asyncIterator]).toBe('function');
  });
});
