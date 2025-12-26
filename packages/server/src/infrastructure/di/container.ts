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
import BookRepository from '~/infrastructure/repositories/BookRepository';
import ChapterRepository from '~/infrastructure/repositories/ChapterRepository';
import HaikuRepository from '~/infrastructure/repositories/HaikuRepository';
import CanvasService from '~/infrastructure/services/CanvasService';
import { ICanvasServiceToken } from '~/domain/services/ICanvasService';
import { IEventBusToken } from '~/domain/events/IEventBus';
import { GraphQLEventBus } from '~/application/events/GraphQLEventBus';
import { IOpenAIClientToken } from '~/domain/gateways/IOpenAIClient';
import OpenAIClient from '~/infrastructure/external/OpenAIClient';
import { IMessagePublisherToken } from '~/application/messaging/IMessagePublisher';
import { PubSubMessagePublisher } from '~/infrastructure/messaging/PubSubMessagePublisher';

container.register<IBookRepository>(IBookRepositoryToken, {
  useClass: BookRepository,
});

container.register<IChapterRepository>(IChapterRepositoryToken, {
  useClass: ChapterRepository,
});

container.register<IHaikuRepository>(IHaikuRepositoryToken, {
  useClass: HaikuRepository,
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
