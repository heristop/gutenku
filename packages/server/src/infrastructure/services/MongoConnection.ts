import log from 'loglevel';
import mongoose, { type Connection } from 'mongoose';
import { singleton } from 'tsyringe';

@singleton()
export default class MongoConnection {
  public db: Connection | null = null;

  public async connect(): Promise<Connection> {
    const uri =
      process.env.MONGODB_URI || 'mongodb://root:root@localhost:27017';
    const database = process.env.MONGODB_DB || 'admin';

    try {
      await mongoose.connect(`${uri}/${database}`, {
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.db = mongoose.connection;

      this.db.on('connected', () => {
        log.info(`Connected to MongoDB at ${uri}/${database}`);
      });

      this.db.on('error', (error) => {
        log.error('MongoDB connection error:', error);
      });

      this.db.on('disconnected', () => {
        log.warn('MongoDB disconnected');
      });
    } catch (error) {
      log.error(`Error connecting to ${uri}/${database}: ${error}`);
      log.warn('MongoDB connection failed - some features may be limited');

      this.db = null;
    }

    return this.db;
  }
}
