import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const HaikuSchema = new Schema({
  verses: {
    type: Array<string>,
    required: true,
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
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
  },
  chapter: {
    type: Schema.Types.ObjectId,
    ref: 'Chapter',
  },
});

export default mongoose.model('Haiku', HaikuSchema);
