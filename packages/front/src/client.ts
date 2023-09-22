import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client/core';
import ApolloLinkTimeout from 'apollo-link-timeout';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const envServerHost = import.meta.env.VITE_SERVER_HOST || 'http://localhost:4000';
const envWebSocketHost = import.meta.env.VITE_WEBSOCKET_HOST || 'ws://localhost:4000';

const timeoutLink = new ApolloLinkTimeout(300000); // 300 seconds timeout

const httpLink = new HttpLink({
    uri: `${envServerHost}/graphql`
});

const timeoutHttpLink = timeoutLink.concat(httpLink);

const wsLink = new GraphQLWsLink(createClient({
    url: `${envWebSocketHost}/graphql-ws`,
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

export const apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    connectToDevTools: false,
});

