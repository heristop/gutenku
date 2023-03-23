# GutenKu Api

## Installation

```bash
cp .env.dist .env
yarn install
```

Batch:

```bash
pip3 install requests
pip3 install python-dotenv
pip3 install pymongo
```

MongoDB:

```bash
docker-compose up -d
```

## Usage

Fetch and store books

```bash
yarn setup
```

## Run

```bash
yarn dev
```

## Generate

Generate Haiku:

```bash
yarn extract
```

## Post

Send Instagram Post:

```bash
yarn post
```
