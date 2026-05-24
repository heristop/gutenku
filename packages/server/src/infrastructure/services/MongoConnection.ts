import mongoose, { type Connection } from 'mongoose';
import { singleton } from 'tsyringe';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('mongo');

// Strip credentials from a MongoDB URI before logging.
function redactUri(uri: string): string {
  try {
    const parsed = new URL(uri);
    if (parsed.username || parsed.password) {
      parsed.username = '***';
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return '<invalid-uri>';
  }
}

@singleton()
export default class MongoConnection {
  public db: Connection | null = null;

  public async connect(): Promise<Connection | null> {
    const isProduction = process.env.NODE_ENV === 'production';
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      if (isProduction) {
        throw new Error('MONGODB_URI must be set in production');
      }
      uri = 'mongodb://root:root@localhost:27017';
      log.warn('MONGODB_URI not set, using local dev fallback');
    }

    const database = process.env.MONGODB_DB || 'admin';
    const safeUri = redactUri(uri);

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
        log.info({ uri: safeUri, database }, 'Connected to MongoDB');
      });

      this.db.on('error', (error) => {
        log.error({ err: error }, 'MongoDB connection error');
      });

      this.db.on('disconnected', () => {
        log.warn('MongoDB disconnected');
      });
    } catch (error) {
      log.error(
        { err: error, uri: safeUri, database },
        'Error connecting to MongoDB',
      );
      log.warn('MongoDB connection failed - some features may be limited');

      this.db = null;
    }

    return this.db;
  }
}
