import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
  split,
} from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const envServerHost =
  import.meta.env.VITE_SERVER_HOST || 'http://localhost:4000';
const envWebSocketHost =
  import.meta.env.VITE_WEBSOCKET_HOST || 'ws://localhost:4000';

class TimeoutLink extends ApolloLink {
  private defaultTimeout: number;

  constructor(timeoutMs = 300000) {
    super();
    this.defaultTimeout = timeoutMs;
  }

  request(operation, forward) {
    if (!forward) {
      return null;
    }

    const operationType =
      getMainDefinition(operation.query)?.operation ?? 'query';

    if ('subscription' === operationType) {
      return forward(operation);
    }

    const context = operation.getContext();
    const timeout =
      typeof context.timeout === 'number' && context.timeout >= 0
        ? context.timeout
        : this.defaultTimeout;

    if (timeout <= 0) {
      return forward(operation);
    }

    let controller: AbortController | undefined;

    if ('undefined' !== typeof AbortController) {
      const fetchOptions = context.fetchOptions || {};
      controller = fetchOptions.controller || new AbortController();
      operation.setContext({
        ...context,
        fetchOptions: {
          ...fetchOptions,
          controller,
          signal: controller.signal,
        },
      });
    }

    const chainObservable = forward(operation);

    return new Observable((observer) => {
      const timer = setTimeout(() => {
        controller?.abort();

        const timeoutError = new Error('Timeout exceeded');
        timeoutError.name = 'TimeoutError';
        (timeoutError as Error & { timeout: number }).timeout = timeout;

        observer.error(timeoutError);
      }, timeout);

      const subscription = chainObservable.subscribe({
        next: (value) => {
          clearTimeout(timer);
          observer.next(value);
        },
        error: (err) => {
          clearTimeout(timer);
          observer.error(err);
        },
        complete: () => {
          clearTimeout(timer);
          observer.complete();
        },
      });

      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
      };
    });
  }
}

const timeoutLink = new TimeoutLink(300000); // 300 seconds timeout

const httpLink = new HttpLink({
  uri: `${envServerHost}/graphql`,
});

const timeoutHttpLink = timeoutLink.concat(httpLink);

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${envWebSocketHost}/graphql-ws`,
  }),
);

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
  devtools: {
    enabled: false,
  },
});
