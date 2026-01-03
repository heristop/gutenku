# Repository Guidelines

## Project Structure & Module Organization

GutenKu is a pnpm workspace with the GraphQL API in `packages/server` and the Vue client in `packages/front`. The API uses a DDD layout (`src/presentation`, `src/application`, `src/domain`, `src/infrastructure`) with shared helpers under `src/shared` and Vitest suites in `packages/server/tests`. The client keeps UI pieces in `src/components` and `src/views`, shared state in `src/store`, composables in `src/composables`, and Cypress specs under `cypress/e2e`; marketing assets sit in `/assets`.

## Build, Test, and Development Commands

Install dependencies once with `pnpm install`. Run `pnpm dev` to start the API (`@gutenku/server dev`) and client (`@gutenku/front dev`) together; the API also exposes data tools via `pnpm --filter @gutenku/server setup|extract|train|post`. Production builds use `pnpm --filter @gutenku/front build` and `pnpm --filter @gutenku/server start:dist`.

## Coding Style & Naming Conventions

Both packages are TypeScript-first with flat ESLint configs and Prettier enforcing `tabWidth: 2`, `singleQuote: true`, and trailing commas. Server files follow PascalCase names for services, repositories, and DI tokens, while interface tokens stay as string literals such as `'IHaikuRepository'`. Vue components should use multi-word names, composables start with `use`, and global styles belong in `src/styles`; run `pnpm lint` before every commit to auto-fix formatting.

## Testing Guidelines

Execute API tests with `pnpm --filter @gutenku/server test`, and use `test:cov` when reviewers need coverage output. Front-end flows live in Cypress `.cy.ts` specs; trigger them headless with `pnpm --filter @gutenku/front test` or interactively via `test:gui`, keeping fixtures in `cypress/fixtures`. Prefer colocating new Vitest files near the domain they validate and update stored screenshots whenever UI changes break them.

## Commit & Pull Request Guidelines

Git history follows Conventional Commits (`type(scope): summary`) with scopes like `front`, `server`, or feature areas (`feat(chapter): …`). Keep subjects imperative, bundle related work, and avoid drive-by lint fixes. Pull requests should outline behavior changes, flag new environment variables or migrations, link issues, and show evidence that `pnpm lint` and `pnpm test` passed (screenshots for UI, terminal snippets for scripts).

## Environment & Data Notes

Copy the env templates from `packages/server/.env.example` and `packages/front/.env.example` before running services. Bring MongoDB and supporting services up with `docker compose up -d`, tear them down with `docker compose down`, and isolate Python dependencies for `packages/server/scripts` using a virtual environment fed by `requirements.txt`.
