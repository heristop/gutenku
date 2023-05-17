# GutenKu Api

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v14.0.0 or newer)
- yarn
- Python (for scraping eBooks)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/heristop/gutenku.git
```

2. Navigate to the project directory:

```bash
cd gutenku/packages/server
```

3. Copy env variables (optional):

```bash
cp .env.dist .env
```

4. Install NPM dependencies:

```bash
yarn install
```

5. Install Python dependencies:

```bash
pip3 install -r requirements.txt
```

6. INstall MongoDB:

_Using Docker:_

```bash
docker-compose up -d
```

## Usage

### Fetch

Fetch and store books:

```bash
yarn setup [--delete]
```

### Run

```bash
yarn dev
```

### Train

Uses Markov Chain to evaluate transitions:

```bash
yarn train
```

### Generate

Generate Haiku:

```bash
yarn extract
```

### Post

Send Instagram Post:

```bash
yarn post [--selection-count=50] [--no-interaction] [--no-openai]
```

## Test

To run the test suite, execute the following command:

```bash
yarn test
```

## Built With

- Node.js
- Apollo Server
- GraphQL
- Yarn
- Python (for eBook scraping)
- Natural Language Processing (NLP)
- Markov Chains

---

![GutenKu Logo](/assets/logo/gutenku.png)

<footer>
    <p>© 2023 heristop / <a href="https://instagram.com/gutenku.poem" target="_blank">@gutenku.poem</a>. All rights reserved.</p>
</footer>
