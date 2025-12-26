import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ChapterSchema = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
  },
  content: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

// Indexes
ChapterSchema.index({ book: 1 });
ChapterSchema.index({ content: 'text' }); // Text search index

export default mongoose.model('Chapter', ChapterSchema);
