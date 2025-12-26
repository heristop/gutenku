import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ChapterSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
  },
});

// Indexes for faster queries
ChapterSchema.index({ book: 1 });
ChapterSchema.index({ content: 'text' }); // Text index for efficient search

export default mongoose.model('Chapter', ChapterSchema);
