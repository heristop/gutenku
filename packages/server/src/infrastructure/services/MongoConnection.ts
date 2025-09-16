import log from 'loglevel';
import mongoose, { Connection } from 'mongoose';
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
        // Connection timeout settings
        serverSelectionTimeoutMS: 5000, // 5 seconds
        connectTimeoutMS: 10000, // 10 seconds
        socketTimeoutMS: 45000, // 45 seconds
        maxPoolSize: 10, // Connection pool size
      });

      this.db = mongoose.connection;

      // Set up connection event handlers
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

      // Don't throw error - allow graceful degradation
      // The application can still work without MongoDB for basic functionality
      this.db = null;
    }

    return this.db;
  }
}
/* c8 ignore file */
