# GutenKu Api

[![Ci](https://github.com/heristop/gutenku/actions/workflows/api.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/api.yaml)
[![Apollo](https://img.shields.io/badge/apollo-4.x-blue.svg)](https://www.apollographql.com/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18)
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

---

![GutenKu Logo](/assets/logo/gutenku.png)

<footer>
    <p>© 2023 heristop / <a href="https://instagram.com/gutenku.poem" target="_blank">@gutenku.poem</a>. All rights reserved.</p>
</footer>
