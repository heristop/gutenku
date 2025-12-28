# GutenKu Api

[![Ci](https://github.com/heristop/gutenku/actions/workflows/api.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/api.yaml)
[![Apollo](https://img.shields.io/badge/apollo-4.x-blue.svg)](https://www.apollographql.com/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v22)
- Docker (for MongoDB)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/heristop/gutenku.git
```

2. Copy env variables (optional):

```bash
cp gutenku/packages/server/.env.dist gutenku/packages/server/.env
```

3. Install dependencies and start:

```bash
make install
make dev
```

## Usage

Run `make help` for all available commands.

| Command            | Description                      |
| ------------------ | -------------------------------- |
| `make dev`         | Start Docker + server + frontend |
| `make server`      | Start only API server            |
| `make setup`       | Import books                     |
| `make setup-reset` | Reset and reimport all books     |
| `make train`       | Train Markov chain model         |
| `make test`        | Run all tests                    |
| `make lint`        | Run linters                      |

## Built With

- Node.js / TypeScript / ESM
- Apollo Server / GraphQL
- MongoDB
- Tsyringe (DI)
- Natural Language Processing (NLP)
- OpenAI

## Architecture & DI (DDD)

- Layers
  - Presentation: GraphQL schema + resolvers
  - Application: Orchestrates use cases (services, event bus)
  - Domain: Entities/services/interfaces (no infra)
  - Infrastructure: Repositories, external clients, PubSub publisher

- Domain interfaces (tokens)
  - `IBookRepository` (`'IBookRepository'`): `src/domain/repositories/IBookRepository.ts`
  - `IChapterRepository` (`'IChapterRepository'`): `src/domain/repositories/IChapterRepository.ts`
  - `IHaikuRepository` (`'IHaikuRepository'`): `src/domain/repositories/IHaikuRepository.ts`
  - `ICanvasService` (`'ICanvasService'`): `src/domain/services/ICanvasService.ts`
  - `IEventBus` (`'IEventBus'`): `src/domain/events/IEventBus.ts`
  - `IOpenAIClient` (`'IOpenAIClient'`): `src/domain/gateways/IOpenAIClient.ts`
  - `IMessagePublisher` (`'IMessagePublisher'`): `src/application/messaging/IMessagePublisher.ts`

- DI bindings
  - Declared in `src/infrastructure/di/container.ts` (imported by `src/index.ts`).
  - Example bindings: repos → Mongo implementations, `ICanvasService` → `CanvasService`, `IMessagePublisher` → `PubSubMessagePublisher`, `IOpenAIClient` → `OpenAIClient`, `IEventBus` → `GraphQLEventBus`.

- Injecting by token (example)

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

- Events
  - Domain raises `QuoteGeneratedEvent`.
  - `GraphQLEventBus` maps it to GraphQL subscription payload via `IMessagePublisher`.

- Tests
  - Domain-level invariants use simple typed fakes (no DB). See `tests/haiku_invariants.ts`.

### Diagram (layers and event flow)

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Presentation (GraphQL)                                               │
│  - typeDefs, resolvers                                               │
│         │ subscribe                                                  │
│         ▼                                                            │
│  IMessagePublisher (PubSubMessagePublisher) ──► GraphQL PubSub       │
└─────────┬────────────────────────────────────────────────────────────┘
          │ uses
          ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Application                                                          │
│  - Services (BookService, ChapterService, HaikuBridgeService, …)     │
│  - GraphQLEventBus (IEventBus)                                       │
└─────────┬────────────────────────────────────────────────────────────┘
          │ calls
          ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Domain                                                               │
│  - Services (HaikuGeneratorService, NaturalLanguage, …)              │
│  - Interfaces: IBookRepository, IChapterRepository, IHaikuRepository │
│                 ICanvasService, IOpenAIClient, IEventBus             │
│  - Events: QuoteGeneratedEvent                                       │
└─────────┬────────────────────────────────────────────────────────────┘
          │ implemented by
          ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Infrastructure                                                       │
│  - Mongo repositories (BookRepository, ChapterRepository, HaikuRepository)
│  - CanvasService                                                     │
│  - OpenAIClient                                                      │
│  - PubSubMessagePublisher                                            │
│  - DI container bindings                                             │
└──────────────────────────────────────────────────────────────────────┘
```
