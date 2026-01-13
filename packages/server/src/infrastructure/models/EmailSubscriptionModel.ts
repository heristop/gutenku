import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const EmailSubscriptionSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'unsubscribed'],
    default: 'pending',
  },
  verificationToken: {
    type: String,
    required: true,
  },
  unsubscribeToken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  lastNotificationSentAt: {
    type: Date,
    default: null,
  },
  tokenExpiresAt: {
    type: Date,
    required: true,
  },
});

// Indexes
EmailSubscriptionSchema.index({ email: 1 }, { unique: true });
EmailSubscriptionSchema.index({ status: 1 });
EmailSubscriptionSchema.index({ verificationToken: 1 });
EmailSubscriptionSchema.index({ unsubscribeToken: 1 });
EmailSubscriptionSchema.index(
  { tokenExpiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { status: 'pending' },
  },
);

export default mongoose.model('EmailSubscription', EmailSubscriptionSchema);
