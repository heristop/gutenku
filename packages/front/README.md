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
(`src/services/analytics/`). Which one runs is decided by the env alone.

| Mode         | Env                                              |
| ------------ | ------------------------------------------------ |
| `none`       | nothing set                                      |
| `umami`      | `VITE_UMAMI_SRC` **and** `VITE_UMAMI_WEBSITE_ID` |
| `cloudflare` | `VITE_CLOUDFLARE_TOKEN`                          |

Umami wins when both are configured, so a half-finished migration measures once
instead of twice. The mode is read from the env and nothing else: `cap:build`
ships the very `dist` that vite-ssg prerendered, so an answer that varied by
platform would prerender markup the device then hydrates without. Native
(Capacitor) builds load no web tag all the same — the providers rule that out
themselves.

Both providers are cookieless: neither sets a cookie nor writes an identifier
on the visitor's device, which is what a cookie banner asks about. So no
consent question is asked, the banner and the footer's cookie control never
render, and analytics starts on its own instead of waiting for a decision.
Umami does still derive a pseudonymous visitor hash server-side: cookieless is
not the same claim as anonymous.

The consent stack is kept, dormant, behind `isConsentRequired()` in
`src/services/analytics/config.ts` — one function to flip should a provider
that needs a cookie ever ship again. Decisions already stored by visitors are
left untouched, so flipping it back finds them.

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
