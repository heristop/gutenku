import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VerifyEmailHandler } from '../src/application/queries/email/VerifyEmailHandler';
import { UnsubscribeEmailHandler } from '../src/application/queries/email/UnsubscribeEmailHandler';
import { SubscribeEmailHandler } from '../src/application/commands/email/SubscribeEmailHandler';
import { VerifyEmailQuery } from '../src/application/queries/email/VerifyEmailQuery';
import { UnsubscribeEmailQuery } from '../src/application/queries/email/UnsubscribeEmailQuery';
import { SubscribeEmailCommand } from '../src/application/commands/email/SubscribeEmailCommand';
import type { IEmailSubscriptionRepository, EmailSubscription } from '../src/domain/repositories/IEmailSubscriptionRepository';

vi.mock('../src/application/services/bridges/ResendBridge', () => ({
  sendVerificationEmail: vi.fn(() => Promise.resolve(true)),
}));

const createMockSubscription = (
  overrides?: Partial<EmailSubscription>,
): EmailSubscription => ({
  email: 'test@example.com',
  status: 'pending',
  verificationToken: 'a'.repeat(64),
  unsubscribeToken: 'b'.repeat(64),
  createdAt: new Date(),
  verifiedAt: null,
  lastNotificationSentAt: null,
  tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  ...overrides,
});

describe('VerifyEmailHandler', () => {
  let handler: VerifyEmailHandler;
  let mockRepository: {
    findByVerificationToken: ReturnType<typeof vi.fn>;
    verify: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    findByUnsubscribeToken: ReturnType<typeof vi.fn>;
    unsubscribe: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    getVerifiedSubscribers: ReturnType<typeof vi.fn>;
    getVerifiedCount: ReturnType<typeof vi.fn>;
    updateLastNotificationSent: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockRepository = {
      findByVerificationToken: vi.fn(),
      verify: vi.fn(),
      findByEmail: vi.fn(),
      findByUnsubscribeToken: vi.fn(),
      unsubscribe: vi.fn(),
      create: vi.fn(),
      getVerifiedSubscribers: vi.fn(),
      getVerifiedCount: vi.fn(),
      updateLastNotificationSent: vi.fn(),
    };
    handler = new VerifyEmailHandler(
      mockRepository as IEmailSubscriptionRepository,
    );
  });

  it('rejects invalid token (wrong length)', async () => {
    const result = await handler.execute(new VerifyEmailQuery('short-token'));

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Invalid verification token');
  });

  it('rejects empty token', async () => {
    const result = await handler.execute(new VerifyEmailQuery(''));

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Invalid verification token');
  });

  it('returns error when subscription not found', async () => {
    mockRepository.findByVerificationToken.mockResolvedValue(null);
    const token = 'a'.repeat(64);

    const result = await handler.execute(new VerifyEmailQuery(token));

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Invalid or expired verification link');
  });

  it('returns success when already verified', async () => {
    mockRepository.findByVerificationToken.mockResolvedValue(
      createMockSubscription({ status: 'verified' }),
    );
    const token = 'a'.repeat(64);

    const result = await handler.execute(new VerifyEmailQuery(token));

    expect(result.success).toBeTruthy();
    expect(result.message).toBe('Email already verified');
  });

  it('returns error when unsubscribed', async () => {
    mockRepository.findByVerificationToken.mockResolvedValue(
      createMockSubscription({ status: 'unsubscribed' }),
    );
    const token = 'a'.repeat(64);

    const result = await handler.execute(new VerifyEmailQuery(token));

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('This email has been unsubscribed');
  });

  it('verifies email successfully', async () => {
    mockRepository.findByVerificationToken.mockResolvedValue(
      createMockSubscription({ status: 'pending' }),
    );
    mockRepository.verify.mockResolvedValue(true);
    const token = 'a'.repeat(64);

    const result = await handler.execute(new VerifyEmailQuery(token));

    expect(result.success).toBeTruthy();
    expect(result.message).toBe('Email verified successfully');
    expect(mockRepository.verify).toHaveBeenCalledWith('test@example.com');
  });

  it('handles verification failure', async () => {
    mockRepository.findByVerificationToken.mockResolvedValue(
      createMockSubscription({ status: 'pending' }),
    );
    mockRepository.verify.mockResolvedValue(false);
    const token = 'a'.repeat(64);

    const result = await handler.execute(new VerifyEmailQuery(token));

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Verification failed');
  });

  it('handles repository errors', async () => {
    mockRepository.findByVerificationToken.mockRejectedValue(
      new Error('DB error'),
    );
    const token = 'a'.repeat(64);

    const result = await handler.execute(new VerifyEmailQuery(token));

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Verification failed');
  });
});

describe('UnsubscribeEmailHandler', () => {
  let handler: UnsubscribeEmailHandler;
  let mockRepository: {
    findByUnsubscribeToken: ReturnType<typeof vi.fn>;
    unsubscribe: ReturnType<typeof vi.fn>;
    findByVerificationToken: ReturnType<typeof vi.fn>;
    verify: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    getVerifiedSubscribers: ReturnType<typeof vi.fn>;
    getVerifiedCount: ReturnType<typeof vi.fn>;
    updateLastNotificationSent: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockRepository = {
      findByUnsubscribeToken: vi.fn(),
      unsubscribe: vi.fn(),
      findByVerificationToken: vi.fn(),
      verify: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      getVerifiedSubscribers: vi.fn(),
      getVerifiedCount: vi.fn(),
      updateLastNotificationSent: vi.fn(),
    };
    handler = new UnsubscribeEmailHandler(
      mockRepository as IEmailSubscriptionRepository,
    );
  });

  it('rejects invalid token (wrong length)', async () => {
    const result = await handler.execute(
      new UnsubscribeEmailQuery('short-token'),
    );

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Invalid unsubscribe token');
  });

  it('rejects empty token', async () => {
    const result = await handler.execute(new UnsubscribeEmailQuery(''));

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Invalid unsubscribe token');
  });

  it('returns error when subscription not found', async () => {
    mockRepository.findByUnsubscribeToken.mockResolvedValue(null);
    const token = 'b'.repeat(64);

    const result = await handler.execute(new UnsubscribeEmailQuery(token));

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Invalid unsubscribe link');
  });

  it('returns success when already unsubscribed', async () => {
    mockRepository.findByUnsubscribeToken.mockResolvedValue(
      createMockSubscription({ status: 'unsubscribed' }),
    );
    const token = 'b'.repeat(64);

    const result = await handler.execute(new UnsubscribeEmailQuery(token));

    expect(result.success).toBeTruthy();
    expect(result.message).toBe('Already unsubscribed');
  });

  it('unsubscribes successfully', async () => {
    mockRepository.findByUnsubscribeToken.mockResolvedValue(
      createMockSubscription({ status: 'verified' }),
    );
    mockRepository.unsubscribe.mockResolvedValue(true);
    const token = 'b'.repeat(64);

    const result = await handler.execute(new UnsubscribeEmailQuery(token));

    expect(result.success).toBeTruthy();
    expect(result.message).toBe('Successfully unsubscribed');
    expect(mockRepository.unsubscribe).toHaveBeenCalledWith('test@example.com');
  });

  it('handles unsubscribe failure', async () => {
    mockRepository.findByUnsubscribeToken.mockResolvedValue(
      createMockSubscription({ status: 'verified' }),
    );
    mockRepository.unsubscribe.mockResolvedValue(false);
    const token = 'b'.repeat(64);

    const result = await handler.execute(new UnsubscribeEmailQuery(token));

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Unsubscribe failed');
  });

  it('handles repository errors', async () => {
    mockRepository.findByUnsubscribeToken.mockRejectedValue(
      new Error('DB error'),
    );
    const token = 'b'.repeat(64);

    const result = await handler.execute(new UnsubscribeEmailQuery(token));

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Unsubscribe failed');
  });
});

describe('SubscribeEmailHandler', () => {
  let handler: SubscribeEmailHandler;
  let mockRepository: {
    findByEmail: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    findByVerificationToken: ReturnType<typeof vi.fn>;
    verify: ReturnType<typeof vi.fn>;
    findByUnsubscribeToken: ReturnType<typeof vi.fn>;
    unsubscribe: ReturnType<typeof vi.fn>;
    getVerifiedSubscribers: ReturnType<typeof vi.fn>;
    getVerifiedCount: ReturnType<typeof vi.fn>;
    updateLastNotificationSent: ReturnType<typeof vi.fn>;
  };
  let sendVerificationEmailMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    const ResendBridge = await import(
      '../src/application/services/bridges/ResendBridge'
    );
    sendVerificationEmailMock = vi.mocked(ResendBridge.sendVerificationEmail);
    sendVerificationEmailMock.mockResolvedValue(true);

    mockRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findByVerificationToken: vi.fn(),
      verify: vi.fn(),
      findByUnsubscribeToken: vi.fn(),
      unsubscribe: vi.fn(),
      getVerifiedSubscribers: vi.fn(),
      getVerifiedCount: vi.fn(),
      updateLastNotificationSent: vi.fn(),
    };
    handler = new SubscribeEmailHandler(
      mockRepository as IEmailSubscriptionRepository,
    );
  });

  it('rejects invalid email format', async () => {
    const result = await handler.execute(
      new SubscribeEmailCommand('not-an-email'),
    );

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Invalid email format');
  });

  it('returns already subscribed for verified email', async () => {
    mockRepository.findByEmail.mockResolvedValue(
      createMockSubscription({ status: 'verified' }),
    );

    const result = await handler.execute(
      new SubscribeEmailCommand('test@example.com'),
    );

    expect(result.success).toBeTruthy();
    expect(result.message).toBe('Already subscribed');
  });

  it('resends verification for pending email', async () => {
    const subscription = createMockSubscription({ status: 'pending' });
    mockRepository.findByEmail.mockResolvedValue(subscription);

    const result = await handler.execute(
      new SubscribeEmailCommand('test@example.com'),
    );

    expect(result.success).toBeTruthy();
    expect(result.message).toBe('Verification email resent');
    expect(sendVerificationEmailMock).toHaveBeenCalledWith(
      'test@example.com',
      subscription.verificationToken,
    );
  });

  it('fails when resend email fails', async () => {
    mockRepository.findByEmail.mockResolvedValue(
      createMockSubscription({ status: 'pending' }),
    );
    sendVerificationEmailMock.mockResolvedValue(false);

    const result = await handler.execute(
      new SubscribeEmailCommand('test@example.com'),
    );

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Failed to send verification email');
  });

  it('creates new subscription for new email', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(createMockSubscription());

    const result = await handler.execute(
      new SubscribeEmailCommand('new@example.com'),
    );

    expect(result.success).toBeTruthy();
    expect(result.message).toBe('Verification email sent');
    expect(mockRepository.create).toHaveBeenCalled();
    expect(sendVerificationEmailMock).toHaveBeenCalled();
  });

  it('fails when send email fails for new subscription', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(createMockSubscription());
    sendVerificationEmailMock.mockResolvedValue(false);

    const result = await handler.execute(
      new SubscribeEmailCommand('new@example.com'),
    );

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Failed to send verification email');
  });

  it('handles repository errors', async () => {
    mockRepository.findByEmail.mockRejectedValue(new Error('DB error'));

    const result = await handler.execute(
      new SubscribeEmailCommand('test@example.com'),
    );

    expect(result.success).toBeFalsy();
    expect(result.message).toBe('Subscription failed');
  });

  it('normalizes email to lowercase', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(createMockSubscription());

    await handler.execute(new SubscribeEmailCommand('TEST@EXAMPLE.COM'));

    expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('trims whitespace from email', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(createMockSubscription());

    await handler.execute(
      new SubscribeEmailCommand('  test@example.com  '),
    );

    expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });
});
