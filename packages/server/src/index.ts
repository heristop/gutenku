import 'reflect-metadata';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
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
import MongoConnection from '~/infrastructure/services/MongoConnection';
import { createLogger } from '~/infrastructure/services/Logger';
import { initPuzzleScheduler } from '~/infrastructure/schedulers/PuzzleScheduler';
import '~/infrastructure/di/container';

// Use explicit path for dotenv to work correctly in PM2 cluster mode
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const log = createLogger('server');
const isProduction = process.env.NODE_ENV === 'production';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

// Rate limiting for all GraphQL requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    errors: [{ message: 'Too many requests, please try again later' }],
  },
});

// Fields whose execution triggers OpenAI calls (priced operations).
const AI_FIELD_NAMES = new Set(['haiku', 'haikuGeneration']);

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

// Optional API-key gate for AI operations. When INTERNAL_API_KEY is set,
// AI-invoking requests must present a matching X-Internal-Key header.
// When unset, the gate is a no-op (rate limiting still applies).
function aiKeyGuard(req: Request, res: Response, next: NextFunction): void {
  if (!INTERNAL_API_KEY) {
    next();

    return;
  }

  if (!requestInvokesAI(req.body as GraphQLBody)) {
    next();

    return;
  }
  const provided = req.header('x-internal-key');

  if (provided && provided === INTERNAL_API_KEY) {
    next();

    return;
  }
  res.status(401).json({
    errors: [
      { message: 'AI operations require a valid X-Internal-Key header' },
    ],
  });
}

interface MyContext {
  db?: Connection;
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

  const serverCleanup = useServer({ schema }, wsServer);

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

  // bodyParser must run before the rate limiter so the GraphQL body is parsed
  // when `requestInvokesAI` inspects it.
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: (process.env.CORS_WHITELIST || 'http://localhost:3000').split(
        ',',
      ),
    }),
    bodyParser.json({ limit: '128kb' }),
    generalLimiter,
    aiLimiter,
    aiKeyGuard,
    expressMiddleware(server, {
      context: async () => ({ db: db ?? undefined }),
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
  } catch (err) {
    log.error({ err }, 'Error starting the node server');
  }
}

main();
