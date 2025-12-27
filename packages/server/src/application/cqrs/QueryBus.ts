import { injectable, container } from 'tsyringe';
import type { IQueryBus } from './IQueryBus';
import type { IQuery } from './IQuery';
import { type IQueryHandler, createQueryHandlerToken } from './IQueryHandler';

@injectable()
export class QueryBus implements IQueryBus {
  async execute<TResult>(query: IQuery<TResult>): Promise<TResult> {
    const queryName = query.constructor.name;
    const handlerToken = createQueryHandlerToken(queryName);

    const handler =
      container.resolve<IQueryHandler<IQuery<TResult>, TResult>>(handlerToken);

    return handler.execute(query);
  }
}
