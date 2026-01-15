import { inject, injectable } from 'tsyringe';
import { createLogger } from '~/infrastructure/services/Logger';
import { seededRandom } from '~/shared/helpers/SeededRandom';

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
        quality: document.quality,
        extractionMethod: document.extractionMethod,
      });
    });

    return haikuValues;
  }

  /**
   * Get haiku from cache by seed (date-based).
   * Excludes haikus created on or after excludeDate.
   */
  async extractDeterministicFromCache(
    seed: number,
    minCachedDocs: number,
    excludeDate: string,
  ): Promise<HaikuValue | null> {
    if (!this.db) {
      return null;
    }

    try {
      const haikusCollection = this.db.collection('haikus');

      // Convert excludeDate (YYYY-MM-DD) to ISO timestamp at midnight
      const excludeTimestamp = `${excludeDate}T00:00:00.000Z`;
      const matchFilter = { createdAt: { $lt: excludeTimestamp } };

      // Get count of eligible documents
      const countResult = await haikusCollection
        .aggregate([{ $match: matchFilter }, { $count: 'total' }], {
          maxTimeMS: 5000,
        })
        .toArray();

      const count = countResult[0]?.total || 0;

      if (count < minCachedDocs) {
        log.info(
          { count, minCachedDocs, excludeDate, excludeTimestamp },
          'Not enough cached documents for deterministic extraction',
        );
        return null;
      }

      // Use seeded random to select index
      const random = seededRandom(seed);
      const index = Math.floor(random() * count);

      // Fetch selected document
      const result = await haikusCollection
        .aggregate(
          [
            { $match: matchFilter },
            { $sort: { _id: 1 } },
            { $skip: index },
            { $limit: 1 },
          ],
          { maxTimeMS: 5000 },
        )
        .toArray();

      if (result.length === 0) {
        return null;
      }

      log.info(
        { seed, index, count, excludeDate, excludeTimestamp },
        'Deterministic cache extraction',
      );

      const selected = result[0] as unknown as HaikuDocument;
      return {
        book: selected.book,
        cacheUsed: true,
        chapter: selected.chapter,
        rawVerses: selected.rawVerses,
        verses: selected.verses,
        quality: selected.quality,
        extractionMethod: selected.extractionMethod,
      };
    } catch (error) {
      log.warn(
        { err: error },
        'Deterministic cache extraction failed, falling back to generation',
      );
      return null;
    }
  }

  async getCacheCount(): Promise<number> {
    if (!this.db) {
      return 0;
    }

    try {
      const haikusCollection = this.db.collection('haikus');
      return await haikusCollection.estimatedDocumentCount();
    } catch {
      return 0;
    }
  }
}
