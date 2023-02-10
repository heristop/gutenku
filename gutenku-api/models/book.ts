import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const BookSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    chapters: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Chapter'
    }]
});

export default mongoose.model('Book', BookSchema);

