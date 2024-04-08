import { ApolloServer } from '@apollo/server';
import { expect, it } from '@jest/globals';
import { Connection } from 'mongoose';
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
  typeDefs,
  resolvers,
});

it('returns books', async () => {
  const response = await testServer.executeOperation({
    query: `
            query Query {
                books {
                    id
                    chapters {
                        id
                    }
                }
            }
        `,
    variables: {},
  });

  expect(response).toBeTruthy();
  expect(response).toHaveProperty('body');
  expect(response.body).toHaveProperty('singleResult');
  // eslint-disable-next-line
    expect(response.body['singleResult']).toHaveProperty('data');
  // eslint-disable-next-line
    expect(response.body['singleResult'].data).toHaveProperty('books');
});
