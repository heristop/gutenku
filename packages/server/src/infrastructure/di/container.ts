import { container } from 'tsyringe';
import {
  type IBookRepository,
  IBookRepositoryToken,
} from '~/domain/repositories/IBookRepository';
import {
  type IChapterRepository,
  IChapterRepositoryToken,
} from '~/domain/repositories/IChapterRepository';
import {
  type IHaikuRepository,
  IHaikuRepositoryToken,
} from '~/domain/repositories/IHaikuRepository';
import {
  type IGlobalStatsRepository,
  IGlobalStatsRepositoryToken,
} from '~/domain/repositories/IGlobalStatsRepository';
import BookRepository from '~/infrastructure/repositories/BookRepository';
import ChapterRepository from '~/infrastructure/repositories/ChapterRepository';
import HaikuRepository from '~/infrastructure/repositories/HaikuRepository';
import GlobalStatsRepository from '~/infrastructure/repositories/GlobalStatsRepository';
import CanvasService from '~/infrastructure/services/CanvasService';
import { ICanvasServiceToken } from '~/domain/services/ICanvasService';
import { IEventBusToken } from '~/domain/events/IEventBus';
import { GraphQLEventBus } from '~/application/events/GraphQLEventBus';
import { IOpenAIClientToken } from '~/domain/gateways/IOpenAIClient';
import OpenAIClient from '~/infrastructure/external/OpenAIClient';
import { IMessagePublisherToken } from '~/application/messaging/IMessagePublisher';
import { PubSubMessagePublisher } from '~/infrastructure/messaging/PubSubMessagePublisher';
import { IGutenbergClientToken } from '~/domain/gateways/IGutenbergClient';
import { GutenbergClient } from '~/infrastructure/external/GutenbergClient';
import { IFileSystemServiceToken } from '~/domain/gateways/IFileSystemService';
import { FileSystemService } from '~/infrastructure/services/FileSystemService';

container.register<IBookRepository>(IBookRepositoryToken, {
  useClass: BookRepository,
});

container.register<IChapterRepository>(IChapterRepositoryToken, {
  useClass: ChapterRepository,
});

container.register<IHaikuRepository>(IHaikuRepositoryToken, {
  useClass: HaikuRepository,
});

container.register<IGlobalStatsRepository>(IGlobalStatsRepositoryToken, {
  useClass: GlobalStatsRepository,
});

container.register(ICanvasServiceToken, {
  useClass: CanvasService,
});

container.register(IEventBusToken, {
  useClass: GraphQLEventBus,
});

container.register(IOpenAIClientToken, {
  useClass: OpenAIClient,
});

container.register(IMessagePublisherToken, {
  useClass: PubSubMessagePublisher,
});

container.register(IGutenbergClientToken, {
  useClass: GutenbergClient,
});

container.register(IFileSystemServiceToken, {
  useClass: FileSystemService,
});

// Import CQRS registrations
import './cqrs-registrations';
