# GutenKu Server

[![CI](https://github.com/heristop/gutenku/actions/workflows/server.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/server.yaml)
[![Apollo](https://img.shields.io/badge/apollo-4.x-blue.svg)](https://www.apollographql.com/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)

> [!NOTE]
> GraphQL API for haiku generation from classic literature

[← Back to main README](../../README.md)

---

## Prerequisites

- Node.js (v22)
- Docker (for MongoDB)

## Installation

```bash
# From root directory
make install
make dev
```

Or copy env variables first:

```bash
cp .env.dist .env
```

## Commands

| Command            | Description                      |
| ------------------ | -------------------------------- |
| `make dev`         | Start Docker + server + frontend |
| `make server`      | Start only API server            |
| `make setup`       | Import books                     |
| `make setup-reset` | Reset and reimport all books     |
| `make train`       | Train Markov chain model         |
| `make test`        | Run all tests                    |
| `make lint`        | Run linters                      |

## Tech Stack

- Node.js / TypeScript / ESM
- Apollo Server / GraphQL
- MongoDB
- Tsyringe (DI)
- Natural Language Processing (NLP)
- OpenAI

## Architecture (DDD)

### Layers

| Layer          | Responsibility                                   |
| -------------- | ------------------------------------------------ |
| Presentation   | GraphQL schema + resolvers                       |
| Application    | Orchestrates use cases (services, event bus)     |
| Domain         | Entities, services, interfaces (no infra)        |
| Infrastructure | Repositories, external clients, PubSub publisher |

### Domain Interfaces

| Interface            | Path                                             |
| -------------------- | ------------------------------------------------ |
| `IBookRepository`    | `src/domain/repositories/IBookRepository.ts`     |
| `IChapterRepository` | `src/domain/repositories/IChapterRepository.ts`  |
| `IHaikuRepository`   | `src/domain/repositories/IHaikuRepository.ts`    |
| `ICanvasService`     | `src/domain/services/ICanvasService.ts`          |
| `IEventBus`          | `src/domain/events/IEventBus.ts`                 |
| `IOpenAIClient`      | `src/domain/gateways/IOpenAIClient.ts`           |
| `IMessagePublisher`  | `src/application/messaging/IMessagePublisher.ts` |

### DI Bindings

Declared in `src/infrastructure/di/container.ts`:

```ts
import { inject, injectable } from 'tsyringe';
import { IBookRepository } from '../domain/repositories/IBookRepository';

@injectable()
class BookService {
  constructor(
    @inject('IBookRepository') private readonly books: IBookRepository,
  ) {}
}
```

### Event Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Presentation (GraphQL)                                      │
│  typeDefs, resolvers                                        │
│         │ subscribe                                         │
│         ▼                                                   │
│  IMessagePublisher ──► GraphQL PubSub                       │
└─────────┬───────────────────────────────────────────────────┘
          │ uses
          ▼
┌─────────────────────────────────────────────────────────────┐
│ Application                                                 │
│  Services, GraphQLEventBus                                  │
└─────────┬───────────────────────────────────────────────────┘
          │ calls
          ▼
┌─────────────────────────────────────────────────────────────┐
│ Domain                                                      │
│  HaikuGeneratorService, NaturalLanguage                     │
│  Events: QuoteGeneratedEvent                                │
└─────────┬───────────────────────────────────────────────────┘
          │ implemented by
          ▼
┌─────────────────────────────────────────────────────────────┐
│ Infrastructure                                              │
│  Mongo repositories, CanvasService, OpenAIClient            │
└─────────────────────────────────────────────────────────────┘
```
