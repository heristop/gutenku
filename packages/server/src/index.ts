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

// Stricter rate limiting for expensive AI operations
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // Only 5 AI requests per minute
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    errors: [{ message: 'Rate limit exceeded for AI operations' }],
  },
  skip: (req) => {
    const body = req.body as {
      query?: string;
      variables?: { useAI?: boolean };
    };
    return !body?.query?.includes('haiku') || body?.variables?.useAI === false;
  },
});

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
  } else {
    log.warn('MongoDB not available, continuing without DB connection');
  }

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://api.openai.com'],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
        },
      },
      strictTransportSecurity: isProduction
        ? { maxAge: 63072000, includeSubDomains: true, preload: true }
        : false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  app.use(compression());

  // Apply rate limiters to GraphQL endpoint (production only)
  if (isProduction) {
    app.use('/graphql', generalLimiter);
    app.use('/graphql', aiLimiter);
  }

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: (process.env.CORS_WHITELIST || 'http://localhost:3000').split(
        ',',
      ),
    }),
    bodyParser.json(),
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
    const port = Number.parseInt(process.env.SERVER_PORT, 10) || 4000;

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
