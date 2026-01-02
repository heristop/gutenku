# GutenKu Front

[![Ci](https://github.com/heristop/gutenku/actions/workflows/vue.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/vue.yaml)
[![Vue](https://img.shields.io/badge/vue-3-brightgreen.svg)](https://vuejs.org/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v22)
- pnpm

## Installation

1. Clone the repository:

```bash
git clone https://github.com/heristop/gutenku.git
```

2. Copy env variables (optional):

```bash
cp gutenku/packages/front/.env.dist gutenku/packages/front/.env
```

3. Install dependencies and start:

```bash
make install
make dev
```

## Built With

- Vue 3 (Composition API)
- Custom SCSS Design System
- Pinia
- URQL / GraphQL
- Cypress

## Tests

```bash
make test
```

Linux prerequisites for Cypress:

```bash
apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
```
