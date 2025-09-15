import { BookValue } from '../../shared/types';
import BookModel from '../models/BookModel';

export default class BookRepository {
  async getAllBooks(filter: string | null) {
    const query = {};

    if (filter) {
      // Use text search if available, fallback to regex
      query['chapters.content'] = { $regex: filter, $options: 'i' };
    }

    // Optimize query with proper projection and limits
    return await BookModel.find(query)
      .populate('chapters')
      .select('title author reference chapters') // Only select needed fields
      .limit(100) // Add reasonable limit to prevent memory issues
      .exec();
  }

  async getBookById(id: string) {
    return await BookModel.findById(id).populate('chapters').exec();
  }

  async selectRandomBook(): Promise<BookValue> {
    // Use MongoDB aggregation pipeline for efficient random selection
    const randomBooks = await BookModel.aggregate([
      // Match books that have chapters
      { $match: { 'chapters.0': { $exists: true } } },
      // Randomly sample one book
      { $sample: { size: 1 } },
      // Lookup the chapters
      {
        $lookup: {
          from: 'chapters',
          localField: 'chapters',
          foreignField: '_id',
          as: 'chapters',
        },
      },
    ]);

    if (!randomBooks || randomBooks.length === 0) {
      throw new Error('No book found');
    }

    const randomBook = randomBooks[0];

    if (!randomBook.chapters || randomBook.chapters.length === 0) {
      // If somehow we got a book without chapters, try again
      // This should be rare with the aggregation pipeline
      return this.selectRandomBook();
    }

    return randomBook;
  }
}
