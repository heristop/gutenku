import { ApolloServer } from "apollo-server-express";
import { expect, it } from '@jest/globals';
import typeDefs from '../services/typeDefs';

const resolvers = {
    Query: {
        books() {
            return [];
        },
    },
};

it('returns books', async () => {
    const testServer = new ApolloServer({
        typeDefs,
        resolvers,
    });

    const response = await testServer.executeOperation({
        query: `
            query Query() {
                books() {
                    book {
                        title
                        author
                    }
                }
            }
        `,
        variables: {},
    });

    expect(response).toBeTruthy();
    expect(response).toHaveProperty('data');
});
