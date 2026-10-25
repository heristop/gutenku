import 'reflect-metadata';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rateLimit } from 'express-rate-limit';
import { container } from 'tsyringe';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'node:http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { parse as parseGraphql, visit, type DocumentNode } from 'graphql';
import type { Connection } from 'mongoose';
import resolvers from '~/presentation/graphql/resolvers';
import typeDefs from '~/presentation/graphql/typeDefs';
import {
  type AIAccess,
  resolveAIAccess,
} from '~/presentation/graphql/ai-access';
import {
  DAILY_HAIKU_BASE_PATH,
  resolvePublicBaseUrl,
} from '~/presentation/rest/daily-haiku-presenter';
import { createDailyHaikuRouter } from '~/presentation/rest/daily-haiku-router';
import MongoConnection from '~/infrastructure/services/MongoConnection';
import { createLogger } from '~/infrastructure/services/Logger';
import { initPuzzleScheduler } from '~/infrastructure/schedulers/PuzzleScheduler';
import { initDailyHaikuScheduler } from '~/infrastructure/schedulers/DailyHaikuScheduler';
import '~/infrastructure/di/container';

// Use explicit path for dotenv to work correctly in PM2 cluster mode
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const log = createLogger('server');
const isProduction = process.env.NODE_ENV === 'production';

// Rate limiting for all GraphQL requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // 100 requests per IP per window in production; local development reloads,
  // tests and tooling share one IP, so the limit there only guards runaways
  limit: isProduction ? 100 : 2000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    errors: [{ message: 'Too many requests, please try again later' }],
  },
});

// Fields whose execution triggers OpenAI calls (priced operations).
// checkOpenAIKey is free, but limited alike: it must not become a way to
// test keys in bulk
const AI_FIELD_NAMES = new Set(['haiku', 'haikuGeneration', 'checkOpenAIKey']);

interface GraphQLBody {
  query?: string;
  variables?: Record<string, unknown>;
}

// Detect AI-invoking operations by parsing the GraphQL document.
// Returns true if the request would trigger an OpenAI call.
function requestInvokesAI(body: GraphQLBody | undefined): boolean {
  if (!body?.query) {
    return false;
  }

  let doc: DocumentNode;
  try {
    doc = parseGraphql(body.query);
  } catch {
    // Malformed query: let GraphQL produce the error, no need to rate-limit.
    return false;
  }

  let invokesAI = false;
  visit(doc, {
    Field(node) {
      if (!AI_FIELD_NAMES.has(node.name.value)) {
        return;
      }

      const useAIArg = node.arguments?.find((a) => a.name.value === 'useAI');

      // Default behavior of these fields includes AI unless explicitly disabled.
      if (!useAIArg) {
        invokesAI = true;

        return;
      }

      if (useAIArg.value.kind === 'BooleanValue') {
        if (useAIArg.value.value) {
          invokesAI = true;
        }

        return;
      }

      if (useAIArg.value.kind === 'Variable') {
        const varName = useAIArg.value.name.value;

        if (body.variables?.[varName] !== false) {
          invokesAI = true;
        }
      }
    },
  });

  return invokesAI;
}

// Stricter rate limiting for expensive AI operations
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // Only 5 AI requests per minute
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    errors: [{ message: 'Rate limit exceeded for AI operations' }],
  },
  skip: (req) => !requestInvokesAI(req.body as GraphQLBody),
});

interface MyContext {
  db?: Connection;
  publicBaseUrl?: string;
  ai: AIAccess;
}

async function listen(port: number) {
  const app = express();
  app.set('trust proxy', 1);
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ resolvers, typeDefs });

  const wsServer = new WebSocketServer({
    path: '/graphql-ws',
    server: httpServer,
  });

  const serverCleanup = useServer(
    {
      schema,
      // The websocket has no headers: the keys come with the connection's
      // init payload
      context: (ctx) => ({
        ai: resolveAIAccess(
          ctx.connectionParams?.internalKey,
          ctx.connectionParams?.openaiKey,
        ),
      }),
    },
    wsServer,
  );

  const server = new ApolloServer<MyContext>({
    introspection: !isProduction,
    persistedQueries: false,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    schema,
  });

  await server.start();

  const mongoConnection = container.resolve(MongoConnection);

  const db = await mongoConnection.connect();

  if (db) {
    db.on('error', (err) => log.error({ err }, 'MongoDB connection error'));
    db.once('open', () => {
      log.info('Connected to MongoDB');
    });
  }

  if (!db) {
    log.warn('MongoDB not available, continuing without DB connection');
  }

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://api.openai.com'],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
        },
      },
      strictTransportSecurity: isProduction
        ? { maxAge: 63072000, includeSubDomains: true, preload: true }
        : false,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  app.use(compression());

  // Public read-only daily haiku API (own CORS policy, see the router).
  app.use(
    DAILY_HAIKU_BASE_PATH,
    createDailyHaikuRouter({ limiter: generalLimiter }),
  );

  // bodyParser must run before the rate limiter so the GraphQL body is parsed
  // when `requestInvokesAI` inspects it.
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: (process.env.CORS_WHITELIST || 'http://localhost:3000').split(
        ',',
      ),
      // Let browsers reuse a preflight instead of repeating it before every
      // cross-origin request (the native app): Chrome caps this at 2 hours.
      maxAge: 7200,
    }),
    bodyParser.json({ limit: '128kb' }),
    generalLimiter,
    aiLimiter,
    expressMiddleware(server, {
      context: async ({ req }) => ({
        db: db ?? undefined,
        publicBaseUrl: resolvePublicBaseUrl(req),
        ai: resolveAIAccess(
          req.header('x-internal-key'),
          req.header('x-openai-key'),
        ),
      }),
    }),
  );

  return new Promise<void>((resolve, reject) => {
    httpServer.listen(port).once('listening', resolve).once('error', reject);
  });
}

async function main() {
  try {
    const port = Number.parseInt(process.env.SERVER_PORT ?? '', 10) || 4000;

    await listen(port);

    log.info(
      { port },
      'Query endpoint ready at http://localhost:%d/graphql',
      port,
    );
    log.info(
      { port },
      'Subscription endpoint ready at ws://localhost:%d/graphql-ws',
      port,
    );

    // Start midnight puzzle scheduler for WebSocket notifications
    initPuzzleScheduler();
    log.info('Puzzle scheduler initialized');

    // Records the haiku of the day in daily_haikus after each 10:00 UTC rollover
    initDailyHaikuScheduler();
    log.info('Daily haiku scheduler initialized');
  } catch (err) {
    log.error({ err }, 'Error starting the node server');
  }
}

main();
