import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const HaikuSchema = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
  },
  chapter: {
    type: Schema.Types.ObjectId,
    ref: 'Chapter',
  },
  context: {
    type: Array<string>,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expireAt: {
    type: Date,
    required: true,
  },
  verses: {
    type: Array<string>,
    required: true,
  },
});

// Indexes and TTL expiration
HaikuSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-delete
HaikuSchema.index({ book: 1, chapter: 1 });
HaikuSchema.index({ createdAt: -1 });

export default mongoose.model('Haiku', HaikuSchema);
