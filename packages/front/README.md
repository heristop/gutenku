# GutenKu Front

[![CI](https://github.com/heristop/gutenku/actions/workflows/front.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/front.yaml)
[![Vue](https://img.shields.io/badge/vue-3-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)

> [!NOTE]
> Vue 3 frontend for the GutenKu haiku generator

[← Back to main README](../../README.md)

<p align="center">🌸 · 🌸 · 🌸</p>

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
cp .env.example .env
```

## Analytics

Two providers ship behind one `AnalyticsProvider` interface
(`src/services/analytics/`). Which one runs is decided by the env alone, and it
decides the cookie banner with it.

| Mode    | Env                                              | Cookie banner |
| ------- | ------------------------------------------------ | ------------- |
| `none`  | nothing set                                      | none          |
| `ga`    | `VITE_GA_MEASUREMENT_ID`                         | shown         |
| `umami` | `VITE_UMAMI_SRC` **and** `VITE_UMAMI_WEBSITE_ID` | none          |

Umami wins when both are configured, so a half-finished migration measures once
instead of twice. The mode is read from the env and nothing else: `cap:build`
ships the very `dist` that vite-ssg prerendered, so an answer that varied by
platform would prerender markup the device then hydrates without. Native
(Capacitor) builds load no web tag all the same — the providers rule that out
themselves. Self-hosted Umami sets no cookie and stores no visitor
identifier, so there is nothing to consent to: in that mode the banner and the
footer's cookie control are not rendered at all, and analytics starts on its
own instead of waiting for a decision. Decisions already stored under GA are
left in place, so switching back finds them.

```bash
VITE_UMAMI_SRC=https://umami.example.com/script.js
VITE_UMAMI_WEBSITE_ID=00000000-0000-0000-0000-000000000000
# Only when the collect API answers on another origin than the script.
VITE_UMAMI_HOST_URL=
```

The build reads the same variables to swap the `preconnect` hints in
`index.html` and to keep the tracker origin out of the service worker cache
(`vite.config.mts`). If the site is served behind a Content-Security-Policy —
none is defined in this repository, so it would live in the web server or CDN
config — the Umami origin has to be allowed in `script-src` and `connect-src`,
and the Google origins can be dropped once GA is gone.

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
