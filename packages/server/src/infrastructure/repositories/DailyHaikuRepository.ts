import { inject, injectable } from 'tsyringe';
import type { Collection } from 'mongoose';
import type {
  DailyHaikuCard,
  DailyHaikuEntity,
  DailyHaikuFindOptions,
  DailyHaikuNeighbours,
  DailyHaikuPageOptions,
  DailyHaikuPageResult,
  DailyHaikuPublishOptions,
  DailyHaikuRecord,
  DailyHaikuSource,
  IDailyHaikuRepository,
  InsertIfAbsentResult,
  PublishResult,
} from '~/domain/repositories/IDailyHaikuRepository';
import MongoConnection from '~/infrastructure/services/MongoConnection';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('daily-haiku-repo');

export const DAILY_HAIKUS_COLLECTION = 'daily_haikus';

interface StoredCard {
  contentType?: string;
  data?: unknown;
}

type StoredDailyHaiku = Omit<DailyHaikuEntity, 'card' | 'source'> & {
  card?: StoredCard;
  source?: DailyHaikuSource;
};

interface BinaryLike {
  read(position: number, length: number): Uint8Array;
  length(): number;
}

function isBinaryLike(value: unknown): value is BinaryLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as BinaryLike).read === 'function' &&
    typeof (value as BinaryLike).length === 'function'
  );
}

// The driver returns BSON Binary for stored buffers; normalize to Buffer.
function toBuffer(data: unknown): Buffer | null {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }

  if (isBinaryLike(data)) {
    return Buffer.from(data.read(0, data.length()));
  }

  return null;
}

function toCard(card: StoredCard | undefined): DailyHaikuCard | undefined {
  const data = toBuffer(card?.data);

  if (!data) {
    return undefined;
  }

  return { contentType: 'image/jpeg', data };
}

function toRecord(doc: StoredDailyHaiku): DailyHaikuRecord {
  const { card, source, ...rest } = doc;
  const record: DailyHaikuRecord = {
    ...rest,
    publishedAt: new Date(doc.publishedAt),
    // Legacy documents predate `source`: they were all written by the CLI.
    source: source ?? 'cli',
    hasCard: card?.contentType !== undefined || card?.data !== undefined,
  };
  const mappedCard = toCard(card);

  if (mappedCard) {
    record.card = mappedCard;
  }

  return record;
}

const DUPLICATE_KEY = 11000;

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { code?: unknown }).code === DUPLICATE_KEY
  );
}

function dateFilter(options: { before?: string; notAfter?: string }) {
  const range: Record<string, string> = {};

  if (options.before) {
    range.$lt = options.before;
  }

  if (options.notAfter) {
    range.$lte = options.notAfter;
  }

  return Object.keys(range).length > 0 ? { date: range } : {};
}

// A day the site shows: titled and read. An automatic record holds only the
// verses until the daily publication completes it, so it is skipped by the
// archive and by the current-day fallback.
const COMPLETE = {
  title: { $type: 'string', $nin: [''] },
  description: { $type: 'string', $nin: [''] },
};

// Records that a regular (non forced) publication may replace.
const REPLACEABLE = {
  $or: [
    { source: 'auto' },
    { source: { $exists: false }, 'card.data': { $exists: false } },
  ],
};

const QUERY_TIMEOUT_MS = 5000;

@injectable()
export default class DailyHaikuRepository implements IDailyHaikuRepository {
  private indexesReady: Promise<void> | null = null;

  constructor(
    @inject(MongoConnection) private readonly mongoConnection: MongoConnection,
  ) {}

  isAvailable(): boolean {
    return this.mongoConnection.db !== null;
  }

  private collection(): Collection | null {
    const db = this.mongoConnection.db;

    if (!db) {
      return null;
    }

    return db.collection(DAILY_HAIKUS_COLLECTION);
  }

  private async readyCollection(): Promise<Collection | null> {
    const collection = this.collection();

    if (collection) {
      await this.ensureIndexes(collection);
    }

    return collection;
  }

  private async writableCollection(): Promise<Collection> {
    const collection = await this.readyCollection();

    if (!collection) {
      throw new Error('MongoDB is not connected');
    }

    return collection;
  }

  private ensureIndexes(collection: Collection): Promise<void> {
    this.indexesReady ??= collection
      .createIndex({ date: 1 }, { unique: true, name: 'date_unique' })
      .then(() => {})
      .catch((err: unknown) => {
        this.indexesReady = null;
        log.warn({ err }, 'Failed to ensure daily_haikus indexes');
      });

    return this.indexesReady;
  }

  async insertIfAbsent(
    dailyHaiku: DailyHaikuEntity,
  ): Promise<InsertIfAbsentResult> {
    const collection = await this.writableCollection();

    try {
      const result = await collection.updateOne(
        { date: dailyHaiku.date },
        { $setOnInsert: { ...dailyHaiku } },
        { upsert: true },
      );

      return result.upsertedCount > 0 ? 'inserted' : 'exists';
    } catch (err) {
      // Two concurrent upserts on the unique index: the other one won.
      if (isDuplicateKeyError(err)) {
        return 'exists';
      }

      throw err;
    }
  }

  async publish(
    dailyHaiku: DailyHaikuEntity,
    options: DailyHaikuPublishOptions = {},
  ): Promise<PublishResult> {
    const collection = await this.writableCollection();

    if ((await this.insertIfAbsent(dailyHaiku)) === 'inserted') {
      return 'inserted';
    }

    const filter = options.force
      ? { date: dailyHaiku.date }
      : { date: dailyHaiku.date, ...REPLACEABLE };
    const result = await collection.replaceOne(filter, { ...dailyHaiku });

    return result.matchedCount > 0 ? 'replaced' : 'kept';
  }

  async findLatest(
    options: DailyHaikuFindOptions = {},
  ): Promise<DailyHaikuRecord | null> {
    const filter = dateFilter(options);

    return this.findOne(
      options.complete ? { ...filter, ...COMPLETE } : filter,
      options,
    );
  }

  async findByDate(
    date: string,
    options: DailyHaikuFindOptions = {},
  ): Promise<DailyHaikuRecord | null> {
    if (options.notAfter && date > options.notAfter) {
      return null;
    }

    return this.findOne({ date }, options);
  }

  async findPage(
    options: DailyHaikuPageOptions,
  ): Promise<DailyHaikuPageResult> {
    const collection = await this.readyCollection();

    if (!collection) {
      return { records: [], hasMore: false, following: null };
    }

    const docs = await collection
      .find(
        { ...dateFilter(options), ...COMPLETE },
        {
          projection: { _id: 0, 'card.data': 0 },
          sort: { date: -1 },
          limit: options.limit + 1,
          maxTimeMS: QUERY_TIMEOUT_MS,
        },
      )
      .toArray();
    const records = (docs as unknown as StoredDailyHaiku[]).map(toRecord);
    const hasMore = records.length > options.limit;

    return {
      records: records.slice(0, options.limit),
      hasMore,
      following: hasMore ? records[options.limit].date : null,
    };
  }

  async findNeighbours(
    date: string,
    notAfter: string,
  ): Promise<DailyHaikuNeighbours> {
    const collection = await this.readyCollection();

    if (!collection) {
      return { previousDate: null, nextDate: null };
    }

    const options = {
      projection: { _id: 0, date: 1 },
      maxTimeMS: QUERY_TIMEOUT_MS,
    };
    const [previous, next] = await Promise.all([
      collection.findOne(
        { date: { $lt: date }, ...COMPLETE },
        { ...options, sort: { date: -1 } },
      ),
      date < notAfter
        ? collection.findOne(
            { date: { $gt: date, $lte: notAfter }, ...COMPLETE },
            { ...options, sort: { date: 1 } },
          )
        : null,
    ]);

    return {
      previousDate: (previous?.date as string | undefined) ?? null,
      nextDate: (next?.date as string | undefined) ?? null,
    };
  }

  private async findOne(
    filter: Record<string, unknown>,
    options: DailyHaikuFindOptions,
  ): Promise<DailyHaikuRecord | null> {
    const collection = await this.readyCollection();

    if (!collection) {
      return null;
    }

    const projection: Record<string, 0> = { _id: 0 };

    if (!options.withCard) {
      projection['card.data'] = 0;
    }

    const doc = await collection.findOne(filter, {
      projection,
      sort: { date: -1 },
      maxTimeMS: QUERY_TIMEOUT_MS,
    });

    if (!doc) {
      return null;
    }

    return toRecord(doc as unknown as StoredDailyHaiku);
  }
}
