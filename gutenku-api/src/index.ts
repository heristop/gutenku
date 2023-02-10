import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import dotenv from 'dotenv';
import express from 'express'
import http from 'http'
import mongoose, { ConnectOptions } from 'mongoose';
import resolvers from '../services/resolvers';
import typeDefs from '../services/typeDefs';

dotenv.config();

async function listen(port: number) {
    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
    await server.start();

    mongoose.set('strictQuery', true);

    const uri = process.env.MONGODB_URI || 'mongodb://root:root@localhost:27017'
    const database = process.env.MONGODB_DB || 'library'

    mongoose.connect(`${uri}/${database}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions);

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log('Connected to MongoDB!');
    });

    server.applyMiddleware({ app });

    return new Promise((resolve, reject) => {
        httpServer.listen(port).once('listening', resolve).once('error', reject);
    })
}

async function main() {
    try {
        await listen(parseInt(process.env.SERVER_PORT) || 4000);
        console.log(`🚀 Server is ready at http://localhost:${process.env.SERVER_PORT || 4000}/graphql`);
    } catch (err) {
        console.error('💀 Error starting the node server', err);
    }
}

void main();