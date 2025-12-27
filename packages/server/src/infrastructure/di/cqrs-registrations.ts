import { container } from 'tsyringe';
import { IQueryBusToken } from '~/application/cqrs/IQueryBus';
import { QueryBus } from '~/application/cqrs/QueryBus';
import { ICommandBusToken } from '~/application/cqrs/ICommandBus';
import { CommandBus } from '~/application/cqrs/CommandBus';
import {
  createQueryHandlerToken,
  createCommandHandlerToken,
} from '~/application/cqrs';
import { GetAllBooksHandler } from '~/application/queries/books/GetAllBooksHandler';
import { GetBookByIdHandler } from '~/application/queries/books/GetBookByIdHandler';
import { SelectRandomBookHandler } from '~/application/queries/books/SelectRandomBookHandler';
import { GetAllChaptersHandler } from '~/application/queries/chapters/GetAllChaptersHandler';
import { GetChapterByIdHandler } from '~/application/queries/chapters/GetChapterByIdHandler';
import { GenerateHaikuHandler } from '~/application/queries/haiku/GenerateHaikuHandler';
import { CacheHaikuHandler } from '~/application/commands/haiku/CacheHaikuHandler';

container.register(IQueryBusToken, { useClass: QueryBus });
container.register(ICommandBusToken, { useClass: CommandBus });

container.register(createQueryHandlerToken('GetAllBooksQuery'), {
  useClass: GetAllBooksHandler,
});
container.register(createQueryHandlerToken('GetBookByIdQuery'), {
  useClass: GetBookByIdHandler,
});
container.register(createQueryHandlerToken('SelectRandomBookQuery'), {
  useClass: SelectRandomBookHandler,
});
container.register(createQueryHandlerToken('GetAllChaptersQuery'), {
  useClass: GetAllChaptersHandler,
});
container.register(createQueryHandlerToken('GetChapterByIdQuery'), {
  useClass: GetChapterByIdHandler,
});
container.register(createQueryHandlerToken('GenerateHaikuQuery'), {
  useClass: GenerateHaikuHandler,
});

container.register(createCommandHandlerToken('CacheHaikuCommand'), {
  useClass: CacheHaikuHandler,
});
