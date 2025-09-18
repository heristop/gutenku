# GutenKu Api

[![Ci](https://github.com/heristop/gutenku/actions/workflows/api.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/api.yaml)
[![Apollo](https://img.shields.io/badge/apollo-4.x-blue.svg)](https://www.apollographql.com/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v22)
- Python (for scraping eBooks)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/heristop/gutenku.git
```

2. Copy env variables (optional):

```bash
cp gutenku/packages/server/.env.dist gutenku/packages/server/.env
```

4. Install NPM dependencies:

```bash
pnpm i
```

5. Install Python dependencies:

```bash
python3 -m pip install --upgrade pip
pip3 install -r packages/server/requirements.txt
```

6. Install MongoDB:

_Using Docker:_

With Docker Desktop / Docker Compose V2 command:

```bash
docker compose up -d
```

Or with Docker Compose V1:

```bash
docker-compose up -d
```

4. Start server and front

```bash
pnpm dev
```

## Usage

### Fetch

Fetch and store books:

```bash
pnpm run setup [--delete]
```

### Run

```bash
pnpm run dev
```

### Train

Uses Markov Chain to evaluate transitions:

```bash
pnpm train
```

### Generate

Generate Haiku:

```bash
pnpm extract
```

### Post

Send Instagram Post:

```bash
pnpm post [--selection-count=50] [--no-interaction] [--no-openai]
```

## Test

To run the test suite, execute the following command:

```bash
pnpm test
```

## Built With

- Node.js / TypeScript / ESM
- Apollo Server
- GraphQL
- Tsyringe (DI)
- Python (for eBook scraping)
- Natural Language Processing (NLP)

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
