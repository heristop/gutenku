import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { IQueryBusToken } from '../src/application/cqrs';

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

  const queryBusMock = {
    execute: vi.fn().mockImplementation(async (query) => {
      const queryName = query.constructor.name;
      switch (queryName) {
        case 'GetAllBooksQuery':
          return [];
        case 'GetBookByIdQuery':
          return { id: '1' };
        case 'GetAllChaptersQuery':
          return [];
        case 'GetChapterByIdQuery':
          return { id: 'c1' };
        case 'GenerateHaikuQuery':
          return { verses: ['a', 'b', 'c'] };
        default:
          return null;
      }
    }),
  };

  const resolve = vi.fn((tokenOrCls: string | { name?: string }) => {
    // Handle token-based resolution
    if (typeof tokenOrCls === 'string') {
      switch (tokenOrCls) {
        case IQueryBusToken:
          return queryBusMock;
        default:
          return {};
      }
    }
    // Handle class-based resolution
    const name = tokenOrCls?.name;
    switch (name) {
      case 'PubSubService':
        return pubSubMock;
      default:
        return {};
    }
  });

  return { ...actual, container: { ...actual.container, resolve } };
});

// Now import resolvers (uses mocked container)
import resolvers from '../src/presentation/graphql/resolvers';

describe('GraphQL resolvers', () => {
  it('books queries resolve via QueryBus', async () => {
    const result = await resolvers.Query.books(undefined, {
      filter: undefined,
    });
    expect(result).toEqual([]);
    const byId = await resolvers.Query.book(undefined, { id: '1' });
    expect(byId).toEqual({ id: '1' });
  });

  it('chapters queries resolve via QueryBus', async () => {
    const list = await resolvers.Query.chapters(undefined, {
      filter: undefined,
    });
    expect(list).toEqual([]);
    const byId = await resolvers.Query.chapter(undefined, { id: 'c1' });
    expect(byId).toEqual({ id: 'c1' });
  });

  it('haiku query resolves via QueryBus', async () => {
    const h = await resolvers.Query.haiku(undefined, {
      appendImg: false,
      descriptionTemperature: 0.5,
      filter: '',
      markovMinScore: 0,
      selectionCount: 1,
      sentimentMinScore: 0,
      theme: 'default',
      useAI: false,
      useCache: false,
    });
    expect(h).toEqual({ verses: ['a', 'b', 'c'] });
  });

  it('subscription exposes async iterator', async () => {
    const sub = resolvers.Subscription.quoteGenerated.subscribe();
    expect(typeof sub[Symbol.asyncIterator]).toBe('function');
  });

  it('books query with filter passes filter to QueryBus', async () => {
    const result = await resolvers.Query.books(undefined, {
      filter: 'whale',
    });
    expect(result).toEqual([]);
  });

  it('chapters query with filter passes filter to QueryBus', async () => {
    const result = await resolvers.Query.chapters(undefined, {
      filter: 'ocean',
    });
    expect(result).toEqual([]);
  });

  it('haiku query with all options', async () => {
    const h = await resolvers.Query.haiku(undefined, {
      appendImg: true,
      descriptionTemperature: 0.7,
      filter: 'nature',
      markovMinScore: 0.5,
      selectionCount: 5,
      sentimentMinScore: 0.3,
      theme: 'greentea',
      useAI: true,
      useCache: true,
    });
    expect(h).toEqual({ verses: ['a', 'b', 'c'] });
  });

  it('haiku query with minimal options', async () => {
    const h = await resolvers.Query.haiku(undefined, {
      appendImg: false,
      descriptionTemperature: undefined,
      filter: undefined,
      markovMinScore: undefined,
      selectionCount: undefined,
      sentimentMinScore: undefined,
      theme: undefined,
      useAI: undefined,
      useCache: undefined,
    });
    expect(h).toEqual({ verses: ['a', 'b', 'c'] });
  });
});
