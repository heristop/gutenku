import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import dotenv from 'dotenv';
import express, { json } from 'express';
import http from 'http';
import mongoose, { Connection, ConnectOptions } from 'mongoose';
import resolvers from '../services/resolvers';
import typeDefs from '../services/typeDefs';
import cors from 'cors';

dotenv.config();

interface MyContext {
    db?: Connection;
}

async function listen(port: number) {
    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer<MyContext>({
        typeDefs,
        resolvers,
        introspection: true,
        persistedQueries: false,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();

    mongoose.set('strictQuery', true);

    const uri = process.env.MONGODB_URI || 'mongodb://root:root@localhost:27017'
    const database = process.env.MONGODB_DB || 'admin'

    mongoose.connect(`${uri}/${database}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions);

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log('Connected to MongoDB!');
    });

    app.use(
        '/graphql',
        cors<cors.CorsRequest>({ origin: process.env.CORS_WHITELIST.split(',') }),
        json(),
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
        console.log(`🚀 Server is ready at http://localhost:${port}/graphql`);
    } catch (err) {
        console.error('🤖 Error starting the node server', err);
    }
}

void main();
