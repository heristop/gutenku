# GutenKu Api

## Installation

NodeJS:

```bash
cp .env.dist .env
yarn install
```

Python:

```bash
pip3 install -r requirements.txt
```

MongoDB:

_Using Docker:_

```bash
docker-compose up -d
```

## Usage

Fetch and store books:

```bash
yarn setup [--delete]
```

## Run

```bash
yarn dev
```

## Train

Uses Markov Chain to evaluate transitions:

```bash
yarn train
```

## Generate

Generate Haiku:

```bash
yarn extract
```

## Post

Send Instagram Post:

```bash
yarn post [--selection-count=50] [--no-interaction] [--no-openai]
```
