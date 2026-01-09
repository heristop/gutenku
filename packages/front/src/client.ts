import {
  Client,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
} from '@urql/vue';
import {
  createClient as createWSClient,
  type Client as WSClient,
} from 'graphql-ws';

const envServerHost =
  import.meta.env.VITE_SERVER_HOST || 'http://localhost:4000';
const envWebSocketHost =
  import.meta.env.VITE_WEBSOCKET_HOST || 'ws://localhost:4000';

// Lazy WebSocket client - only created when subscriptions are used
let wsClient: WSClient | null = null;

function getWSClient(): WSClient {
  if (!wsClient) {
    wsClient = createWSClient({
      url: `${envWebSocketHost}/graphql-ws`,
      lazy: true,
      lazyCloseTimeout: 3000,
    });
  }
  return wsClient;
}

export function closeWSClient(): void {
  if (wsClient) {
    wsClient.dispose();
    wsClient = null;
  }
}

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
            const unsubscribe = getWSClient().subscribe(input, sink);
            return { unsubscribe };
          },
        };
      },
    }),
  ],
  // cache-and-network: serve from cache while fetching fresh data
  // Haiku generation queries override with 'network-only' to avoid stale results
  requestPolicy: 'cache-and-network',
  fetchOptions: () => ({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(300000), // 300 seconds timeout
  }),
});
