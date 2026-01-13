export interface EmailSubscription {
  email: string;
  status: 'pending' | 'verified' | 'unsubscribed';
  verificationToken: string;
  unsubscribeToken: string;
  createdAt: Date;
  verifiedAt: Date | null;
  lastNotificationSentAt: Date | null;
  tokenExpiresAt: Date;
}

export interface IEmailSubscriptionRepository {
  create(
    email: string,
    verificationToken: string,
    unsubscribeToken: string,
    tokenExpiresAt: Date,
  ): Promise<EmailSubscription>;
  findByEmail(email: string): Promise<EmailSubscription | null>;
  findByVerificationToken(token: string): Promise<EmailSubscription | null>;
  findByUnsubscribeToken(token: string): Promise<EmailSubscription | null>;
  verify(email: string): Promise<boolean>;
  unsubscribe(email: string): Promise<boolean>;
  getVerifiedSubscribers(
    batchSize: number,
    offset: number,
  ): Promise<EmailSubscription[]>;
  getVerifiedCount(): Promise<number>;
  updateLastNotificationSent(email: string): Promise<void>;
}

export const IEmailSubscriptionRepositoryToken = 'IEmailSubscriptionRepository';
