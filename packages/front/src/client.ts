import {
  Client,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
} from '@urql/vue';
import { createClient as createWSClient } from 'graphql-ws';

const envServerHost =
  import.meta.env.VITE_SERVER_HOST || 'http://localhost:4000';
const envWebSocketHost =
  import.meta.env.VITE_WEBSOCKET_HOST || 'ws://localhost:4000';

const wsClient = createWSClient({
  url: `${envWebSocketHost}/graphql-ws`,
});

export const urqlClient = new Client({
  url: `${envServerHost}/graphql`,
  exchanges: [
    cacheExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription(request) {
        const input = { ...request, query: request.query || '' };
        return {
          subscribe(sink) {
            const unsubscribe = wsClient.subscribe(input, sink);
            return { unsubscribe };
          },
        };
      },
    }),
  ],
  requestPolicy: 'network-only',
  fetchOptions: () => ({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(300000), // 300 seconds timeout
  }),
});
