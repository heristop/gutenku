import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs';
import type {
  DailyHaikuRecordWithNeighbours,
  GetDailyHaikuQuery,
} from './GetDailyHaikuQuery';
import {
  IDailyHaikuRepositoryToken,
  type DailyHaikuFindOptions,
  type DailyHaikuRecord,
  type IDailyHaikuRepository,
} from '~/domain/repositories/IDailyHaikuRepository';
import { getCurrentPublicationDate } from '~/domain/services/DailyHaikuSchedule';
import { DailyHaikuRecorder } from '~/application/services/DailyHaikuRecorder';

function isComplete(record: DailyHaikuRecord): boolean {
  return Boolean(record.title?.trim() && record.description?.trim());
}

@injectable()
export class GetDailyHaikuHandler implements IQueryHandler<
  GetDailyHaikuQuery,
  DailyHaikuRecordWithNeighbours | null
> {
  constructor(
    @inject(IDailyHaikuRepositoryToken)
    private readonly repository: IDailyHaikuRepository,
    @inject(DailyHaikuRecorder)
    private readonly recorder: Pick<DailyHaikuRecorder, 'ensureWithin'>,
  ) {}

  async execute(
    query: GetDailyHaikuQuery,
  ): Promise<DailyHaikuRecordWithNeighbours | null> {
    const current = getCurrentPublicationDate();
    const options: DailyHaikuFindOptions = {
      withCard: query.withCard,
      notAfter: current,
    };
    const record = query.date
      ? await this.findByDate(query.date, current, options)
      : await this.findCurrent(current, options);

    if (!record || !query.withNeighbours) {
      return record;
    }

    return {
      ...record,
      ...(await this.repository.findNeighbours(record.date, current)),
    };
  }

  private async findByDate(
    date: string,
    current: string,
    options: DailyHaikuFindOptions,
  ): Promise<DailyHaikuRecord | null> {
    const record = await this.repository.findByDate(date, options);

    if (record || date !== current) {
      return record;
    }

    return this.ensureCurrent(current, options);
  }

  // Lazily records the current day when nothing was published yet, falling
  // back to the latest (stale) record if that takes too long or fails. The
  // site's "today" is always a complete day: while the current record has no
  // title or reading yet, the latest complete one stands in for it.
  private async findCurrent(
    current: string,
    options: DailyHaikuFindOptions,
  ): Promise<DailyHaikuRecord | null> {
    const latest = await this.repository.findLatest(options);
    const record =
      latest?.date === current
        ? latest
        : ((await this.ensureCurrent(current, options)) ?? latest);

    if (!record || isComplete(record)) {
      return record;
    }

    return (
      (await this.repository.findLatest({ ...options, complete: true })) ??
      record
    );
  }

  private async ensureCurrent(
    current: string,
    options: DailyHaikuFindOptions,
  ): Promise<DailyHaikuRecord | null> {
    const ensured = await this.recorder.ensureWithin(current);

    if (!ensured || !options.withCard) {
      return ensured;
    }

    return this.repository.findByDate(current, options);
  }
}
