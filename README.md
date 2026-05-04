# AStack

AStack is an opinionated boilerplate to quickly scaffold product-shaped apps without reinventing the wheel. Optimized for AI codegen.

It ships as a pnpm monorepo with:

- a Vite + React SPA
- a Hono API
- Drizzle ORM on PostgreSQL
- Better Auth for authentication
- a shared package for Zod schemas and TypeScript types
- React Query for robust data fetching client state management

The repo is intentionally small and direct. It is meant to be a starting point you extend, not a framework you have to fight.

## Stack

- Frontend: Vite, React, TanStack Router, React Query, React Hook Form
- Backend: Hono, Better Auth, Drizzle ORM, PostgreSQL
- Shared contracts: Zod + TypeScript in `packages/shared`
- UI: shared component package in `packages/ui`
- Tooling: pnpm workspaces, TypeScript, ESLint, Prettier

## Monorepo Structure

```text
.
├── apps/
│   ├── api/      # Hono API and Better Auth integration
│   └── app/      # Vite React SPA
├── packages/
│   ├── db/       # Drizzle ORM schema, migrations, and db client
│   ├── shared/   # Shared Zod schemas and TS types used by app + api
│   └── ui/       # Shared UI components and global styles
├── package.json
└── pnpm-workspace.yaml
```

## Architecture

### Frontend

The SPA lives in `apps/app`.

- `src/main.tsx` wires React Query, theme support, tooltips, TanStack Router, and toasts.
- `src/routes/` contains file-based routes split into authorized and unauthorized areas.
- `src/lib/api.ts` is a lightweight fetch wrapper to interact with the API.
- `src/lib/auth-client.ts` exposes the Better Auth React client.

The frontend talks to the backend over HTTP and relies on shared Zod schemas from `@workspace/shared` to keep request and response types aligned.

### Backend

The API lives in `apps/api`.

- `src/index.ts` boots the Hono server.
- `src/api.ts` creates the Hono app, enables CORS and logging, mounts Better Auth under `/api/auth/*`, and mounts feature routes under `/api/*`.
- `src/lib/auth.ts` configures Better Auth using the Drizzle adapter.
- `src/routes/tasks.ts` shows the intended pattern: validate input with shared Zod schemas, read the authenticated user from Better Auth, then query the database with Drizzle.

### Shared Contracts

`packages/shared` is the contract layer between frontend and backend.

The current example is `packages/shared/src/api/tasks.ts`, which defines:

- Zod schemas for task inputs and outputs
- inferred TypeScript types for app and API usage
- shared enum-like values such as task status

That means validation and types are defined once and reused on both sides.

### UI Package

`packages/ui` contains shared UI building blocks and global styles so the SPA stays thin and reusable.

## Authentication

Authentication is implemented with Better Auth.

- The server mounts auth handlers at `/api/auth/*`.
- The frontend uses the Better Auth React client from `apps/app/src/lib/auth-client.ts`.
- Session-based auth works across frontend and API because requests include cookies.
- Route protection is handled in the authorized layout by checking `useSession()` before rendering protected pages.

The current boilerplate is already wired for email/password auth.

## Database

Drizzle is used as the ORM and schema source of truth.

- schema definition: `packages/db/src/schema/`
- database client: `packages/db/src/client.ts`
- Drizzle config: `packages/db/drizzle.config.ts`
- generated migrations: `packages/db/drizzle/`

The boilerplate already includes auth tables and a simple task resource so there is an end-to-end example of:

- shared schema definition
- authenticated API route
- database persistence
- React Query data fetching and mutations

## Scaffolding

The fastest way to start a new AStack project is with the [create-astack](https://www.npmjs.com/package/create-astack) package:

```bash
pnpm create astack
```

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create local env files from the examples.

For the API in `apps/api/.env`:

```env
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:3000
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/astack
```

For the SPA in `apps/app/.env`:

```env
VITE_FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

### 3. Prepare the database

Run the Drizzle migration command from the database workspace:

```bash
pnpm --filter @workspace/db migrate
```

If you prefer syncing the schema directly during early development:

```bash
pnpm --filter @workspace/db push
```

### 4. Start the apps

In one terminal:

```bash
pnpm --filter api dev
```

In another terminal:

```bash
pnpm --filter app dev
```

Then open `http://localhost:5173`.

## How To Extend It

The intended workflow for new features is:

1. Define or update shared Zod schemas in `packages/shared`.
2. Implement the backend route in `apps/api` using those schemas.
3. Use the shared inferred types in the SPA.
4. Call the endpoint through `apps/app/src/lib/api.ts`.
5. Manage data fetch state with React Query.
