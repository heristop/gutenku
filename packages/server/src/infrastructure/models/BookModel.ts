import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const BookSchema = new Schema({
    reference: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    chapters: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Chapter'
    }]
});

export default mongoose.model('Book', BookSchema);

