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
    hashtags: {
        type: String,
        required: false
    },
    fr: {
        type: String,
        required: false
    },
    es: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expireAt: {
        type: Date,
        required: true
    },
});

export default mongoose.model('Haiku', HaikuSchema);
