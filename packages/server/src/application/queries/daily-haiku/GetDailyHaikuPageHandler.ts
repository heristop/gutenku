import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs';
import type {
  DailyHaikuRecordPage,
  GetDailyHaikuPageQuery,
} from './GetDailyHaikuPageQuery';
import {
  IDailyHaikuRepositoryToken,
  type IDailyHaikuRepository,
} from '~/domain/repositories/IDailyHaikuRepository';
import { getCurrentPublicationDate } from '~/domain/services/DailyHaikuSchedule';
import { DailyHaikuRecorder } from '~/application/services/DailyHaikuRecorder';

@injectable()
export class GetDailyHaikuPageHandler implements IQueryHandler<
  GetDailyHaikuPageQuery,
  DailyHaikuRecordPage
> {
  constructor(
    @inject(IDailyHaikuRepositoryToken)
    private readonly repository: IDailyHaikuRepository,
    @inject(DailyHaikuRecorder)
    private readonly recorder: Pick<DailyHaikuRecorder, 'ensureWithin'>,
  ) {}

  async execute(query: GetDailyHaikuPageQuery): Promise<DailyHaikuRecordPage> {
    const current = getCurrentPublicationDate();
    const isFirstPage = !query.before || query.before > current;

    if (isFirstPage) {
      await this.recorder.ensureWithin(current);
    }

    const page = await this.repository.findPage({
      before: query.before,
      notAfter: current,
      limit: query.limit,
    });
    const { records } = page;
    const newest = records[0];
    const newestNext = newest
      ? (await this.repository.findNeighbours(newest.date, current)).nextDate
      : null;

    return {
      records: records.map((record, index) => ({
        ...record,
        previousDate: records[index + 1]?.date ?? page.following,
        nextDate: index === 0 ? newestNext : records[index - 1].date,
      })),
      nextBefore: page.hasMore ? (records.at(-1)?.date ?? null) : null,
      hasMore: page.hasMore,
    };
  }
}
