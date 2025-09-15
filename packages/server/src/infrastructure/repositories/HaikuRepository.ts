import log from 'loglevel';
import { injectable } from 'tsyringe';
import { HaikuDocument, HaikuValue } from '../../shared/types';
import MongoConnection from '../services/MongoConnection';
import { Connection } from 'mongoose';

@injectable()
export default class HaikuRepository {
  private db: Connection;

  constructor(mongoConnection: MongoConnection) {
    this.db = mongoConnection.db;
  }

  async createCacheWithTTL(haiku: HaikuValue, ttl: number): Promise<void> {
    if (false === !!this.db) {
      return;
    }

    const haikusCollection = this.db.collection('haikus');

    const haikuData = {
      ...haiku,
      createdAt: new Date(Date.now()).toISOString(),
      expireAt: new Date(Date.now() + ttl),
    };

    await haikusCollection.insertOne(haikuData);
  }

  async extractFromCache(
    size: number,
    minCachedDocs: number,
  ): Promise<HaikuValue[]> {
    if (false === !!this.db) {
      return [];
    }

    try {
      const haikusCollection = this.db.collection('haikus');

      // Add timeout for countDocuments operation
      const countPromise = haikusCollection.countDocuments();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database operation timeout')), 5000),
      );

      const documentCount = (await Promise.race([
        countPromise,
        timeoutPromise,
      ])) as number;

      if (documentCount < minCachedDocs) {
        log.info(
          `Not enough cached documents: ${documentCount} < ${minCachedDocs}`,
        );
        return [];
      }

      log.info('Extract from cache');

      // Add timeout for aggregation operation
      const aggregatePromise = haikusCollection
        .aggregate([{ $sample: { size } }])
        .toArray();
      const aggregateTimeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Database aggregation timeout')),
          5000,
        ),
      );

      const sampledHaikus = (await Promise.race([
        aggregatePromise,
        aggregateTimeoutPromise,
      ])) as HaikuDocument[];

      return this.mapCachedHaikuValue(sampledHaikus);
    } catch (error) {
      log.warn(
        'Cache extraction failed, falling back to generation:',
        error.message,
      );
      return [];
    }
  }

  async extractOneFromCache(minCachedDocs: number): Promise<HaikuValue | null> {
    const haikusValues = await this.extractFromCache(1, minCachedDocs);

    if (0 === haikusValues.length) {
      return null;
    }

    return haikusValues[0];
  }

  private mapCachedHaikuValue(collection: HaikuDocument[]): HaikuValue[] {
    const haikuValues = [];

    collection.forEach((document) => {
      haikuValues.push({
        book: document.book,
        chapter: document.chapter,
        verses: document.verses,
        rawVerses: document.rawVerses,
        cacheUsed: true,
      });
    });

    return haikuValues;
  }
}
