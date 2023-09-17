import 'reflect-metadata';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { container } from 'tsyringe';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import { createServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { Connection } from 'mongoose';
import resolvers from './presentation/graphql/resolvers';
import typeDefs from './presentation/graphql/typeDefs';
import MongoConnection from './infrastructure/services/MongoConnection';

dotenv.config();

interface MyContext {
    db?: Connection;
}

async function listen(port: number) {
    const app = express();
    const httpServer = createServer(app);

    // Create the schema, which will be used separately by ApolloServer and
    // the WebSocket server.
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    // Creating the WebSocket server
    const wsServer = new WebSocketServer({
        // This is the `httpServer` we created in a previous step.
        server: httpServer,
        // Pass a different path here if app.use
        // serves expressMiddleware at a different path
        path: '/graphql-ws',
    });

    // Hand in the schema we just created and have the
    // WebSocketServer start listening.
    const serverCleanup = useServer({ schema }, wsServer);

    // Set up ApolloServer.
    const server = new ApolloServer<MyContext>({
        schema,
        introspection: true,
        persistedQueries: false,
        plugins: [
            // Proper shutdown for the HTTP server.
            ApolloServerPluginDrainHttpServer({ httpServer }),

            // Proper shutdown for the WebSocket server.
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ]
    });

    await server.start();

    // Register and instantiate MongoConnection
    container.registerSingleton<MongoConnection>(MongoConnection);
    const mongoConnection = container.resolve(MongoConnection);

    const db = await mongoConnection.connect();

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log('Connected to MongoDB!');
    });

    app.use(
        '/graphql',
        cors<cors.CorsRequest>({ origin: process.env.CORS_WHITELIST.split(',') }),
        bodyParser.json(),
        expressMiddleware(server, {
            context: async () => ({ db: db }),
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

        console.log(`🚀 Query endpoint ready at http://localhost:${port}/graphql`);
        console.log(`🚀 Subscription endpoint ready at ws://localhost:${port}/graphql`);
    } catch (err) {
        console.error('🤖 Error starting the node server', err);
    }
}

void main();
