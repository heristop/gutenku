import 'reflect-metadata';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
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
import '~/infrastructure/di/container';

dotenv.config();

const log = createLogger('server');

interface MyContext {
  db?: Connection;
}

async function listen(port: number) {
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ resolvers, typeDefs });

  const wsServer = new WebSocketServer({
    path: '/graphql-ws',
    server: httpServer,
  });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer<MyContext>({
    introspection: true,
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

  app.use(compression());

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
    const port = Number.parseInt(process.env.SERVER_PORT) || 4000;

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
  } catch (err) {
    log.error({ err }, 'Error starting the node server');
  }
}

void main();
