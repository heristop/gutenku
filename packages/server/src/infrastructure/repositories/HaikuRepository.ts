import log from 'loglevel';
import { inject, injectable } from 'tsyringe';
import { HaikuDocument, HaikuValue } from '../../shared/types';
import { IHaikuRepository } from '../../domain/repositories/IHaikuRepository';
import MongoConnection from '../services/MongoConnection';
import { Connection } from 'mongoose';

@injectable()
export default class HaikuRepository implements IHaikuRepository {
  private db: Connection;

  constructor(@inject(MongoConnection) mongoConnection: MongoConnection) {
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
    if (!this.db) {
      return [];
    }

    try {
      const haikusCollection = this.db.collection('haikus');

      // Single aggregation with $facet to get count and sample in one query
      const result = await haikusCollection
        .aggregate(
          [
            {
              $facet: {
                count: [{ $count: 'total' }],
                sample: [{ $sample: { size } }],
              },
            },
          ],
          { maxTimeMS: 5000 },
        )
        .toArray();

      const count = result[0]?.count[0]?.total || 0;

      if (count < minCachedDocs) {
        log.info(`Not enough cached documents: ${count} < ${minCachedDocs}`);
        return [];
      }

      log.info('Extract from cache');

      return this.mapCachedHaikuValue(result[0].sample as HaikuDocument[]);
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
