import 'reflect-metadata';
import log from 'loglevel';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { container } from 'tsyringe';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { Connection } from 'mongoose';
import resolvers from './presentation/graphql/resolvers';
import typeDefs from './presentation/graphql/typeDefs';
import MongoConnection from './infrastructure/services/MongoConnection';
import './infrastructure/di/container';

dotenv.config();
log.enableAll();

interface MyContext {
  db?: Connection;
}

async function listen(port: number) {
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql-ws',
  });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer<MyContext>({
    schema,
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
  });

  await server.start();

  const mongoConnection = container.resolve(MongoConnection);

  const db = await mongoConnection.connect();

  if (db) {
    db.on('error', log.error.bind(console, 'connection error:'));
    db.once('open', function () {
      log.info('Connected to MongoDB!');
    });
  } else {
    log.warn('MongoDB not available. Continuing without a DB connection.');
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
    const port = parseInt(process.env.SERVER_PORT) || 4000;

    await listen(port);

    log.info(`🚀 Query endpoint ready at http://localhost:${port}/graphql`);
    log.info(
      `🚀 Subscription endpoint ready at ws://localhost:${port}/graphql-ws`,
    );
  } catch (err) {
    log.error('🤖 Error starting the node server', err);
  }
}

void main();
