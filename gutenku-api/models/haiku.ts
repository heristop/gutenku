import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const HaikuSchema = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref: 'Book'
    },
    chapter: {
        type: Schema.Types.ObjectId,
        ref: 'Chapter'
    },
    verses: {
        type: Array<string>,
        required: true
    },
    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        required: true
    },
    expireAt: {
        type: Date,
        required: true
    },
}, { strictQuery: false });

export default mongoose.model('Haiku', HaikuSchema);
