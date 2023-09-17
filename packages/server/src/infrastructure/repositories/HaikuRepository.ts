import { autoInjectable } from 'tsyringe';
import { HaikuValue } from '../../shared/types';
import MongoConnection from '../services/MongoConnection';
import { Connection } from 'mongoose';

@autoInjectable()
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

    async extractFromCache(size = 1, minCachedDocs: number): Promise<HaikuValue | null> {
        if (false === !!this.db) {
            return null;
        }

        const haikusCollection = this.db.collection('haikus');

        if (await haikusCollection.countDocuments() < minCachedDocs) {
            return null;
        }

        const randomHaiku = await haikusCollection
            .aggregate([{ $sample: { size } }])
            .next();

        console.log('Extract from cache');

        return {
            'book': randomHaiku.book,
            'chapter': randomHaiku.chapter,
            'verses': randomHaiku.verses,
            'rawVerses': randomHaiku.rawVerses,
            'cacheUsed': true,
        };
    }
}
