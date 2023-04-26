import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ChapterSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    book: {
        type: Schema.Types.ObjectId,
        ref: 'Book'
    }
});

export default mongoose.model('Chapter', ChapterSchema);
