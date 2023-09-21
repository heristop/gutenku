import { autoInjectable } from 'tsyringe';
import { HaikuDocument, HaikuValue } from '../../shared/types';
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

    async extractFromCache(size: number, minCachedDocs: number): Promise<HaikuValue[] | null> {
        if (false === !!this.db) {
            return null;
        }

        const haikusCollection = this.db.collection('haikus');

        if (await haikusCollection.countDocuments() < minCachedDocs) {
            return null;
        }

        console.log('Extract from cache');

        const sampledHaikus = await haikusCollection
            .aggregate([{ $sample: { size } }])
            .toArray() as HaikuDocument[];

        return this.map(sampledHaikus);
    }

    async extractOneFromCache(minCachedDocs: number): Promise<HaikuValue | null> {
        const haikusValues = await this.extractFromCache(1, minCachedDocs);

        if (0 === haikusValues.length) {
            return;
        }

        return haikusValues[0];
    }

    private map(collection: HaikuDocument[]): HaikuValue[] {
        const haikuValues = [];

        collection.forEach((document) => {
            haikuValues.push({
                'book': document.book,
                'chapter': document.chapter,
                'verses': document.verses,
                'rawVerses': document.rawVerses,
                'cacheUsed': true,
            });
        });

        return haikuValues;
    }
}
