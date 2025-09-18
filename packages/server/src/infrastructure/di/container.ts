import { container } from 'tsyringe';
import {
  IBookRepository,
  IBookRepositoryToken,
} from '../../domain/repositories/IBookRepository';
import {
  IChapterRepository,
  IChapterRepositoryToken,
} from '../../domain/repositories/IChapterRepository';
import {
  IHaikuRepository,
  IHaikuRepositoryToken,
} from '../../domain/repositories/IHaikuRepository';
import BookRepository from '../repositories/BookRepository';
import ChapterRepository from '../repositories/ChapterRepository';
import HaikuRepository from '../repositories/HaikuRepository';
import CanvasService from '../services/CanvasService';
import { ICanvasServiceToken } from '../../domain/services/ICanvasService';
import { IEventBusToken } from '../../domain/events/IEventBus';
import { GraphQLEventBus } from '../../application/events/GraphQLEventBus';
import { IOpenAIClientToken } from '../../domain/gateways/IOpenAIClient';
import OpenAIClient from '../external/OpenAIClient';
import { IMessagePublisherToken } from '../../application/messaging/IMessagePublisher';
import { PubSubMessagePublisher } from '../messaging/PubSubMessagePublisher';

container.register<IBookRepository>(IBookRepositoryToken, {
  useClass: BookRepository,
});

container.register<IChapterRepository>(IChapterRepositoryToken, {
  useClass: ChapterRepository,
});

container.register<IHaikuRepository>(IHaikuRepositoryToken, {
  useClass: HaikuRepository,
});

// Canvas service binding
container.register(ICanvasServiceToken, {
  useClass: CanvasService,
});

// Event bus binding
container.register(IEventBusToken, {
  useClass: GraphQLEventBus,
});

// OpenAI client binding
container.register(IOpenAIClientToken, {
  useClass: OpenAIClient,
});

// Graph message publisher binding (PubSub)
container.register(IMessagePublisherToken, {
  useClass: PubSubMessagePublisher,
});
