import { ApolloServer } from '@apollo/server';
import { expect, it } from '@jest/globals';
import { Connection } from 'mongoose';
import typeDefs from '../services/typeDefs';

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
    expect(response.body.singleResult).toHaveProperty('data');
    expect(response.body.singleResult.data).toHaveProperty('books');
});
