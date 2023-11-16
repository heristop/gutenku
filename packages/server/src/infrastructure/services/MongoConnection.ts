import mongoose, { Connection } from 'mongoose';
import { singleton } from 'tsyringe';

@singleton()
export default class MongoConnection {
    public db: Connection | null = null;

    /**
     * Method to connect to MongoDB using Mongoose
     */
    public async connect(): Promise<Connection> {
        const uri = process.env.MONGODB_URI || 'mongodb://root:root@localhost:27017';
        const database = process.env.MONGODB_DB || 'admin';

        try {
            await mongoose.connect(`${uri}/${database}`);

            this.db = mongoose.connection;
        } catch (error) {
            console.error(`Error connecting to ${uri}/${database}: ${error}`);

            throw error;
        }

        return this.db;
    }
}
