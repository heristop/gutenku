import { ChapterValue } from '../../shared/types';
import ChapterModel from '../models/ChapterModel';

export default class ChapterRepository {
    async getAllChapters(filter: string | null) {
        const query = {};

        if (filter) {
            // eslint-disable-next-line
            query['content'] = { $regex: filter, $options: 'i' };
        }

        return await ChapterModel.find(query).populate('book').exec();
    }

    async getChapterById(id: string) {
        return await ChapterModel.findById(id).populate('book').exec();
    }

    async getFilteredChapters(filterWords: string[]): Promise<(ChapterValue)[]> {
        const filterPattern = filterWords.join('|');
        const query = { 'content': { $regex: filterPattern, $options: 'i' } };

        return await ChapterModel.find(query).populate('book').exec();
    }
}
