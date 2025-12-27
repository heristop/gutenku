import type { IQuery } from './IQuery';

export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult> {
  execute(query: TQuery): Promise<TResult>;
}

// Token factory for consistent handler registration
export const createQueryHandlerToken = (queryName: string): string =>
  `QueryHandler:${queryName}`;
