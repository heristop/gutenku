import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client/core';
import ApolloLinkTimeout from 'apollo-link-timeout';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const envServerHost = import.meta.env.VITE_SERVER_HOST || 'http://localhost:4000';

const timeoutLink = new ApolloLinkTimeout(10000); // 10 seconds timeout

const httpLink = new HttpLink({
    uri: `${envServerHost}/graphql`
});

const timeoutHttpLink = timeoutLink.concat(httpLink);

const wsLink = new GraphQLWsLink(createClient({
    url: `${envServerHost.replace(/^(http:\/\/|https:\/\/)/, "ws://")}/graphql`,
}));

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);

        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    timeoutHttpLink,
);

export const apolloClient  = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    connectToDevTools: true,
});

