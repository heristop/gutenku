# GutenKu Front

[![Vue](https://github.com/heristop/gutenku/actions/workflows/vue.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/vue.yaml)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v14.0.0 or newer)
- yarn

## Installation

1. Clone the repository:

```bash
git clone https://github.com/heristop/gutenku.git
```

2. Navigate to the project directory:

```bash
cd gutenku/packages/front
```

3. Copy env variables (optional):

```bash
cp .env.dist .env
```

4. Install NPM dependencies:

```bash
yarn install
```

## Tests

Prerequisites:

```bash
apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
```

Cypress:

```bash
yarn add cypress --dev -g
```

---

![GutenKu Logo](/assets/logo/gutenku.png)

<footer>
    <p>© 2023 heristop / <a href="https://instagram.com/gutenku.poem" target="_blank">@gutenku.poem</a>. All rights reserved.</p>
</footer>
