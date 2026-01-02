# GutenKu Front

[![CI](https://github.com/heristop/gutenku/actions/workflows/front.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/front.yaml)
[![Vue](https://img.shields.io/badge/vue-3-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)

> [!NOTE]
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

Cypress prerequisites:

- **macOS / Windows**: No additional dependencies needed
- **Linux**: Install system libraries:

```bash
# Ubuntu >=24.04 / Debian 13
sudo apt install libgtk-3-0t64 libgbm-dev libnotify-dev libnss3 \
  libxss1 libasound2t64 libxtst6 xauth xvfb

# Ubuntu 22.04 / Debian 11-12
sudo apt install libgtk-3-0 libgbm-dev libnotify-dev libnss3 \
  libxss1 libasound2 libxtst6 xauth xvfb
```
