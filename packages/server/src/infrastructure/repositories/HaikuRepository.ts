import { inject, injectable } from 'tsyringe';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('haiku-repo');
import type { HaikuDocument, HaikuValue } from '~/shared/types';
import type { IHaikuRepository } from '~/domain/repositories/IHaikuRepository';
import MongoConnection from '~/infrastructure/services/MongoConnection';
import type { Connection } from 'mongoose';

@injectable()
export default class HaikuRepository implements IHaikuRepository {
  private db: Connection;

  constructor(@inject(MongoConnection) mongoConnection: MongoConnection) {
    this.db = mongoConnection.db;
  }

  async createCacheWithTTL(haiku: HaikuValue, ttl: number): Promise<void> {
    if (!!this.db === false) {
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
        log.info({ count, minCachedDocs }, 'Not enough cached documents');
        return [];
      }

      log.debug('Extracting from cache');

      return this.mapCachedHaikuValue(result[0].sample as HaikuDocument[]);
    } catch (error) {
      log.warn(
        { err: error },
        'Cache extraction failed, falling back to generation',
      );
      return [];
    }
  }

  async extractOneFromCache(minCachedDocs: number): Promise<HaikuValue | null> {
    const haikusValues = await this.extractFromCache(1, minCachedDocs);

    if (haikusValues.length === 0) {
      return null;
    }

    return haikusValues[0];
  }

  private mapCachedHaikuValue(collection: HaikuDocument[]): HaikuValue[] {
    const haikuValues = [];

    collection.forEach((document) => {
      haikuValues.push({
        book: document.book,
        cacheUsed: true,
        chapter: document.chapter,
        rawVerses: document.rawVerses,
        verses: document.verses,
      });
    });

    return haikuValues;
  }
}
