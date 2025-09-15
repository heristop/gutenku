# GutenKu Front

[![Ci](https://github.com/heristop/gutenku/actions/workflows/vue.yaml/badge.svg)](https://github.com/heristop/gutenku/actions/workflows/vue.yaml)
[![Vue](https://img.shields.io/badge/vue-3-brightgreen.svg)](https://vuejs.org/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18)
- pnpm

## Installation

1. Clone the repository:

```bash
git clone https://github.com/heristop/gutenku.git
```

2. Install NPM dependencies:

```bash
pnpm i
```

3. Copy env variables (optional):

```bash
cp gutenku/packages/front/.env.dist gutenku/packages/front/.env
```

4. Start server and front

```bash
pnpm run dev
```

## Tests

Prerequisites:

```bash
apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
```

Cypress:

```bash
pnpm add cypress --dev -g
```
