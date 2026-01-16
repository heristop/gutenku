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
        quality: document.quality,
        extractionMethod: document.extractionMethod,
      });
    });

    return haikuValues;
  }

  async extractDeterministicFromCache(
    _seed: number,
    minCachedDocs: number,
    excludeDate: string,
  ): Promise<HaikuValue | null> {
    if (!this.db) {
      return null;
    }

    try {
      const haikusCollection = this.db.collection('haikus');

      const todayMidnight = new Date(`${excludeDate}T00:00:00.000Z`);
      const yesterdayMidnight = new Date(todayMidnight);
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);

      const dateFilter = {
        createdAt: {
          $gte: yesterdayMidnight,
          $lt: todayMidnight,
        },
      };

      const countResult = await haikusCollection
        .aggregate([{ $match: dateFilter }, { $count: 'total' }], {
          maxTimeMS: 5000,
        })
        .toArray();

      const count = countResult[0]?.total || 0;

      if (count < minCachedDocs) {
        log.info(
          { count, minCachedDocs, excludeDate, yesterdayMidnight, todayMidnight },
          'Not enough cached documents from yesterday',
        );
        return null;
      }

      const result = await haikusCollection
        .aggregate(
          [
            { $match: dateFilter },
            { $sort: { 'quality.totalScore': -1 } },
            { $limit: 1 },
          ],
          { maxTimeMS: 5000 },
        )
        .toArray();

      if (result.length === 0) {
        return null;
      }

      log.info(
        { count, excludeDate, score: result[0].quality?.totalScore },
        'Daily haiku: highest scored from yesterday',
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

  async extractTopScored(limit: number, percentile = 0.1): Promise<HaikuValue[]> {
    if (!this.db) {
      return [];
    }

    try {
      const haikusCollection = this.db.collection('haikus');

      const totalCount = await haikusCollection.estimatedDocumentCount();

      if (totalCount === 0) {
        return [];
      }

      const topTierCount = Math.max(1, Math.ceil(totalCount * percentile));

      const result = await haikusCollection
        .aggregate(
          [
            { $sort: { 'quality.totalScore': -1 } },
            { $limit: topTierCount },
            { $sample: { size: limit } },
          ],
          { maxTimeMS: 5000 },
        )
        .toArray();

      log.info(
        { count: result.length, limit, totalCount, topTierCount, percentile },
        'Fetched top-percentile haikus from cache',
      );

      return this.mapCachedHaikuValue(result as HaikuDocument[]);
    } catch (error) {
      log.warn({ err: error }, 'Top-scored extraction failed');
      return [];
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
