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
import { GetHaikuVersionHandler } from '~/application/queries/haiku/GetHaikuVersionHandler';
import { GetDailyPuzzleHandler } from '~/application/queries/puzzle/GetDailyPuzzleHandler';
import { SubmitGuessHandler } from '~/application/queries/puzzle/SubmitGuessHandler';
import { ReduceBooksHandler } from '~/application/queries/puzzle/ReduceBooksHandler';
import { GetPuzzleVersionHandler } from '~/application/queries/puzzle/GetPuzzleVersionHandler';
import { GetGlobalStatsHandler } from '~/application/queries/stats/GetGlobalStatsHandler';
import { VerifyEmailHandler } from '~/application/queries/email/VerifyEmailHandler';
import { UnsubscribeEmailHandler } from '~/application/queries/email/UnsubscribeEmailHandler';
import { CacheHaikuHandler } from '~/application/commands/haiku/CacheHaikuHandler';
import { SubscribeEmailHandler } from '~/application/commands/email/SubscribeEmailHandler';
import { FetchBookHandler } from '~/application/commands/book/FetchBookHandler';
import { DeleteBookHandler } from '~/application/commands/book/DeleteBookHandler';
import { SaveBookHandler } from '~/application/commands/book/SaveBookHandler';
import { ImportBookHandler } from '~/application/commands/book/ImportBookHandler';
import { BatchImportBooksHandler } from '~/application/commands/book/BatchImportBooksHandler';

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
container.register(createQueryHandlerToken('GetHaikuVersionQuery'), {
  useClass: GetHaikuVersionHandler,
});
container.register(createQueryHandlerToken('GetDailyPuzzleQuery'), {
  useClass: GetDailyPuzzleHandler,
});
container.register(createQueryHandlerToken('SubmitGuessQuery'), {
  useClass: SubmitGuessHandler,
});
container.register(createQueryHandlerToken('ReduceBooksQuery'), {
  useClass: ReduceBooksHandler,
});
container.register(createQueryHandlerToken('GetPuzzleVersionQuery'), {
  useClass: GetPuzzleVersionHandler,
});
container.register(createQueryHandlerToken('GetGlobalStatsQuery'), {
  useClass: GetGlobalStatsHandler,
});

container.register(createCommandHandlerToken('CacheHaikuCommand'), {
  useClass: CacheHaikuHandler,
});

container.register(createCommandHandlerToken('FetchBookCommand'), {
  useClass: FetchBookHandler,
});

container.register(createCommandHandlerToken('DeleteBookCommand'), {
  useClass: DeleteBookHandler,
});

container.register(createCommandHandlerToken('SaveBookCommand'), {
  useClass: SaveBookHandler,
});

container.register(createCommandHandlerToken('ImportBookCommand'), {
  useClass: ImportBookHandler,
});

container.register(createCommandHandlerToken('BatchImportBooksCommand'), {
  useClass: BatchImportBooksHandler,
});

container.register(createQueryHandlerToken('VerifyEmailQuery'), {
  useClass: VerifyEmailHandler,
});

container.register(createQueryHandlerToken('UnsubscribeEmailQuery'), {
  useClass: UnsubscribeEmailHandler,
});

container.register(createCommandHandlerToken('SubscribeEmailCommand'), {
  useClass: SubscribeEmailHandler,
});
