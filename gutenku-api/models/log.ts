import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const LogSchema = new Schema({
    book_reference: {
        type: String,
        required: true
    },
    book_title: {
        type: String,
        required: true
    },
    book_author: {
        type: String,
        required: true
    },
    haiku_verses: {
        type: Array<string>,
        required: true
    },
    haiku_title: {
        type: String,
        required: false
    },
    haiku_description: {
        type: String,
        required: false
    },
    haiku_image: {
        type: String,
        required: false
    },
    created_at: {
        type: String,
        required: false
    },
});

export default mongoose.model('Log', LogSchema);

