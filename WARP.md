# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Install deps
  ```bash path=null start=null
  npm install
  ```
- Start in watch mode
  ```bash path=null start=null
  npm run dev
  ```
- Lint / fix
  ```bash path=null start=null
  npm run lint
  npm run lint:fix
  ```
- Format / check formatting
  ```bash path=null start=null
  npm run format
  npm run format:check
  ```
- Database (Drizzle + Neon Postgres)
  ```bash path=null start=null
  # Generate migration(s) from current schema
  npm run db:generate

  # Apply pending migrations to the database
  npm run db:migrate

  # Explore DB in Drizzle Studio
  npm run db:studio
  ```

Notes:
- No build step and no test script are defined in package.json.
- The server entrypoint is `src/index.js` → `src/server.js` → `src/app.js`.
- Required env vars (set via `.env` or your shell):
  - `DATABASE_URL` (Neon Postgres connection string)
  - `JWT_SECRET`
  - Optional: `PORT`, `NODE_ENV`, `LOG_LEVEL`

## Architecture (high level)

- Web server: Express (ESM) initialized in `src/app.js`, started in `src/server.js`.
  - Security/middleware: `helmet`, `cors`, JSON/urlencoded parsers, `cookie-parser`.
  - Request logging: `morgan` piped to a Winston logger (`src/config/logger.js`) that logs to console (non-prod) and to files under `logs/`.
- Routing: Feature-scoped under `src/routes/`. Example: `auth.routes.js` mounted at `/api/auth`.
- Controllers: Input handling/HTTP responses (e.g., `src/controllers/auth.controller.js`).
  - Validation with Zod schemas in `src/validations/`.
  - Uses helpers for formatting validation errors in `src/utils/format.js`.
- Services: Business logic and DB access (e.g., `src/services/auth.service.js`).
- Data layer: Drizzle ORM models in `src/models/` (e.g., `user.model.js`).
  - Database config `src/config/database.js` (Neon HTTP driver + Drizzle). Migrations live under `drizzle/`.
- Utilities: JWT (`src/utils/jwt.js`), cookies (`src/utils/cookies.js`), formatting helpers, etc.
- Module resolution: ESM with path aliases via `package.json#imports`:
  - `#config/*` → `src/config/*`
  - `#controllers/*` → `src/controllers/*`
  - `#middleware/*` → `src/middleware/*` (folder may not exist yet)
  - `#models/*` → `src/models/*`
  - `#routes/*` → `src/routes/*`
  - `#validations/*` → `src/validations/*`
  - Utilities live under `src/utils/` and are imported directly or via aliases where configured.

## Testing

- There is no configured test runner or `test` script. If tests are added later (e.g., Vitest/Jest), include commands here for running all tests and a single test.
