# GutenKu Front

[![CI](https://github.com/heristop/gutenku/actions/workflows/front.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/front.yaml)
[![Vue](https://img.shields.io/badge/vue-3-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)

> Vue 3 frontend for the GutenKu haiku generator

[← Back to main README](../../README.md)

---

## Prerequisites

- Node.js (v22)
- pnpm

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

## Tech Stack

- Vue 3 (Composition API)
- Custom SCSS Design System
- Pinia (State Management)
- URQL / GraphQL
- Cypress (E2E Testing)

## Commands

| Command      | Description          |
| ------------ | -------------------- |
| `pnpm dev`   | Start dev server     |
| `pnpm build` | Build for production |
| `pnpm test`  | Run Cypress tests    |
| `pnpm lint`  | Run linter           |

## Tests

```bash
make test
```

Linux prerequisites for Cypress:

```bash
apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev \
  libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
```
