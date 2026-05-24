import { ApolloServer } from '@apollo/server';
import { describe, expect, it } from 'vitest';
import type { Connection } from 'mongoose';
import typeDefs from '../src/presentation/graphql/typeDefs';

const resolvers = {
  Query: {
    books() {
      return [];
    },
  },
};

interface MyContext {
  db?: Connection;
}

const testServer = new ApolloServer<MyContext>({
  resolvers,
  typeDefs,
});

interface BooksData {
  books: unknown[];
}
function isBooksData(value: unknown): value is BooksData {
  if (typeof value !== 'object' || value === null || !('books' in value)) {
    return false;
  }
  const books = (value as { books: unknown }).books;
  
return Array.isArray(books);
}

describe('GraphQL Query: books', () => {
  it('returns an empty array with no resolver data', async () => {
    const response = await testServer.executeOperation({
      query: `
        query Query {
          books { id chapters { id } }
        }
      `,
    });

    expect(response.body.kind).toBe('single');
    const { data, errors } = response.body.singleResult;
    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(isBooksData(data)).toBeTruthy();

    // Type guard above asserted the shape; narrow now so the next assertion is unconditional.
    const booksData = data as BooksData;
    expect(booksData.books.length).toBe(0);
  });
});
