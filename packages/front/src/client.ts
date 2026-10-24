import {
  Client,
  cacheExchange,
  fetchExchange,
  makeOperation,
  mapExchange,
  subscriptionExchange,
  type Operation,
} from '@urql/vue';
import { Kind } from 'graphql';
import {
  createClient as createWSClient,
  type Client as WSClient,
} from 'graphql-ws';
import { watch } from 'vue';
import { getOpenAIKey, useOpenAIKey } from '@/core/composables/openai-key';

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
      // A visitor's own OpenAI key rides with the connection (no headers on
      // a websocket); read when connecting, so a new key needs a new socket
      connectionParams: () => {
        const openaiKey = getOpenAIKey();

        return openaiKey ? { openaiKey } : {};
      },
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

// A changed or forgotten key must not keep riding an open socket
if (!import.meta.env.SSR) {
  watch(useOpenAIKey().key, closeWSClient);
}

// Only the operations that can call OpenAI carry the visitor's key
const AI_FIELDS = new Set(['haiku']);

function usesAI(operation: Operation): boolean {
  const document = operation.query;

  if (!('definitions' in document)) {
    return false;
  }

  return document.definitions.some(
    (definition) =>
      definition.kind === Kind.OPERATION_DEFINITION &&
      definition.selectionSet.selections.some(
        (selection) =>
          selection.kind === Kind.FIELD && AI_FIELDS.has(selection.name.value),
      ),
  );
}

const openAIKeyExchange = mapExchange({
  onOperation(operation) {
    const openaiKey = getOpenAIKey();

    if (!openaiKey || !usesAI(operation)) {
      return operation;
    }

    const base = operation.context.fetchOptions;
    const options = (typeof base === 'function' ? base() : base) ?? {};

    return makeOperation(operation.kind, operation, {
      ...operation.context,
      fetchOptions: {
        ...options,
        // Only ever in a header, never in a URL
        headers: { ...options.headers, 'X-OpenAI-Key': openaiKey },
      },
    });
  },
});

export const urqlClient = new Client({
  url: `${envServerHost}/graphql`,
  exchanges: [
    cacheExchange,
    openAIKeyExchange,
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
  // The Content-Type is required even on GET queries: Apollo's CSRF
  // prevention rejects a "simple" request. Cross-origin (native app, dev) it
  // makes each query preflighted; the API caches preflights (cors maxAge).
  fetchOptions: () => ({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(300000), // 300 seconds timeout
  }),
});
