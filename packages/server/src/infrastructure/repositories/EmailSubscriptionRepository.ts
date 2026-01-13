import { inject, injectable } from 'tsyringe';
import { createLogger } from '~/infrastructure/services/Logger';
import type {
  IEmailSubscriptionRepository,
  EmailSubscription,
} from '~/domain/repositories/IEmailSubscriptionRepository';
import MongoConnection from '~/infrastructure/services/MongoConnection';
import type { Connection } from 'mongoose';

const log = createLogger('email-subscription-repo');

@injectable()
export default class EmailSubscriptionRepository
  implements IEmailSubscriptionRepository
{
  private db: Connection;

  constructor(@inject(MongoConnection) mongoConnection: MongoConnection) {
    this.db = mongoConnection.db;
  }

  async create(
    email: string,
    verificationToken: string,
    unsubscribeToken: string,
    tokenExpiresAt: Date,
  ): Promise<EmailSubscription> {
    const collection = this.db.collection('emailsubscriptions');

    const subscription: EmailSubscription = {
      email: email.toLowerCase().trim(),
      status: 'pending',
      verificationToken,
      unsubscribeToken,
      createdAt: new Date(),
      verifiedAt: null,
      lastNotificationSentAt: null,
      tokenExpiresAt,
    };

    await collection.insertOne(subscription);
    log.info({ email: subscription.email }, 'Email subscription created');
    return subscription;
  }

  async findByEmail(email: string): Promise<EmailSubscription | null> {
    if (!this.db) {
      return null;
    }

    const collection = this.db.collection('emailsubscriptions');
    const result = await collection.findOne({
      email: email.toLowerCase().trim(),
    });
    return result as unknown as EmailSubscription | null;
  }

  async findByVerificationToken(
    token: string,
  ): Promise<EmailSubscription | null> {
    if (!this.db) {
      return null;
    }

    const collection = this.db.collection('emailsubscriptions');
    const result = await collection.findOne({
      verificationToken: token,
    });
    return result as unknown as EmailSubscription | null;
  }

  async findByUnsubscribeToken(
    token: string,
  ): Promise<EmailSubscription | null> {
    if (!this.db) {
      return null;
    }

    const collection = this.db.collection('emailsubscriptions');
    const result = await collection.findOne({
      unsubscribeToken: token,
    });
    return result as unknown as EmailSubscription | null;
  }

  async verify(email: string): Promise<boolean> {
    if (!this.db) {
      return false;
    }

    const collection = this.db.collection('emailsubscriptions');
    const result = await collection.updateOne(
      { email: email.toLowerCase().trim(), status: 'pending' },
      { $set: { status: 'verified', verifiedAt: new Date() } },
    );

    if (result.modifiedCount > 0) {
      log.info({ email }, 'Email subscription verified');
    }

    return result.modifiedCount > 0;
  }

  async unsubscribe(email: string): Promise<boolean> {
    if (!this.db) {
      return false;
    }

    const collection = this.db.collection('emailsubscriptions');
    const result = await collection.updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { status: 'unsubscribed' } },
    );

    if (result.modifiedCount > 0) {
      log.info({ email }, 'Email subscription cancelled');
    }

    return result.modifiedCount > 0;
  }

  async getVerifiedSubscribers(
    batchSize: number,
    offset: number,
  ): Promise<EmailSubscription[]> {
    if (!this.db) {
      return [];
    }

    const collection = this.db.collection('emailsubscriptions');
    const results = await collection
      .find({ status: 'verified' })
      .skip(offset)
      .limit(batchSize)
      .toArray();
    return results as unknown as EmailSubscription[];
  }

  async getVerifiedCount(): Promise<number> {
    if (!this.db) {
      return 0;
    }

    const collection = this.db.collection('emailsubscriptions');
    return collection.countDocuments({ status: 'verified' });
  }

  async updateLastNotificationSent(email: string): Promise<void> {
    if (!this.db) {
      return;
    }

    const collection = this.db.collection('emailsubscriptions');
    await collection.updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { lastNotificationSentAt: new Date() } },
    );
  }
}
