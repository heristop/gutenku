import mongoose, { type Connection } from 'mongoose';
import { singleton } from 'tsyringe';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('mongo');

@singleton()
export default class MongoConnection {
  public db: Connection | null = null;

  public async connect(): Promise<Connection> {
    const uri =
      process.env.MONGODB_URI || 'mongodb://root:root@localhost:27017';
    const database = process.env.MONGODB_DB || 'admin';

    try {
      await mongoose.connect(uri, {
        dbName: database,
        connectTimeoutMS: 10000,
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.db = mongoose.connection;

      this.db.on('connected', () => {
        log.info({ uri, database }, 'Connected to MongoDB');
      });

      this.db.on('error', (error) => {
        log.error({ err: error }, 'MongoDB connection error');
      });

      this.db.on('disconnected', () => {
        log.warn('MongoDB disconnected');
      });
    } catch (error) {
      log.error({ err: error, uri, database }, 'Error connecting to MongoDB');
      log.warn('MongoDB connection failed - some features may be limited');

      this.db = null;
    }

    return this.db;
  }
}
