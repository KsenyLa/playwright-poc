# Warehouse CRM - React + Express + Postgres + Playwright

A monorepo POC for warehouse CRUD operations with:
- `apps/web`: React + Vite frontend
- `apps/api`: Express + plain SQL (`pg`) + Postgres backend
- `tests/`: Playwright end-to-end tests

## Stack

- React 18 + React Router
- Express 4
- PostgreSQL 16 (Docker)
- `pg` (no ORM)
- Playwright

## Monorepo Layout

- `apps/web` - frontend app (`src/`, `index.html`, `vite.config.js`)
- `apps/api` - backend API (`src/`, `db/init`, `tests/`)
- `tests` - Playwright specs and POM helpers

Playwright E2E runs create and clean up their own unique data through the UI, so the suite does not depend on a backend reset endpoint.

## API Endpoints

- `GET /health`
- `GET/POST /warehouses`
- `PUT/DELETE /warehouses/:id`
- `GET/POST /products`
- `PUT/DELETE /products/:id`
- `GET/POST /positions`
- `PUT/DELETE /positions/:id`
- `POST /migration/import-local`

Delete behavior:
- Deleting a warehouse or product that is referenced by positions returns `409`.

## Database Bootstrap and Seed Data

Docker Compose mounts SQL init scripts from `apps/api/db/init` into Postgres:
- `01_schema.sql` creates tables and constraints.
- `02_seed.sql` inserts starter warehouses, products, and positions.

Important:
- Postgres init scripts run only when the data volume is created for the first time.
- To rerun bootstrap scripts from scratch, recreate the volume.

## Start Database in Docker

Run these commands from the project root:

Start DB:
```bash
docker compose up -d
```

Stop DB:
```bash
docker compose down
```

Reset DB and rerun schema + seed:
```bash
docker compose down -v && docker compose up -d
```

Useful checks:

See container status:
```bash
docker compose ps
```

See Postgres logs:
```bash
docker compose logs -f postgres
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env values:

```bash
cp .env.example .env
```

3. Start Postgres:

```bash
docker compose up -d
```

## Run the App

Start frontend and backend together:

```bash
npm run server
```

Start frontend only:

```bash
npm run frontend
```

Start backend only:

```bash
npm run backend
```

Frontend: `http://localhost:5173`
API: `http://localhost:3001`

`npm run backend` loads env values from the root `.env`.

## Data Source

The web app reads and writes data through the backend API and database.
Local browser storage is not used for app data anymore.
`POST /migration/import-local` remains available as an optional manual migration endpoint.

## Tests

Run backend API tests:

```bash
npm run test:backend
```

This runs the backend test suite from `apps/api/tests`.
It requires `DATABASE_URL` and an initialized Postgres DB.

Run Playwright E2E tests:

```bash
npm run e2e
```

Playwright starts:
- API with `npm run backend:start`
- Web with `npm run frontend`

The CRUD E2E specs run sequentially inside each spec file, and different spec files can run in parallel.

Open Playwright UI mode:

```bash
npm run e2e:ui
```

Run Playwright headed:

```bash
npm run e2e:headed
```

Open the HTML Playwright report:

```bash
npx playwright show-report
```

Report URL:
- `http://localhost:9323`

## Scripts

- `npm run server` - start frontend and backend together
- `npm run frontend` - start frontend only
- `npm run backend` - start backend only in watch mode
- `npm run backend:start` - start backend once without watch mode
- `npm run e2e` - run Playwright end-to-end tests
- `npm run e2e:ui` - open Playwright UI mode
- `npm run e2e:headed` - run Playwright in headed mode
- `npm run test:backend` - run backend API tests
- `npm run build:web` - build frontend
- `npm run preview:web` - preview frontend build

## Troubleshooting: "Failed to fetch" in Frontend

If the UI shows `Failed to fetch` while backend and DB are running, it is usually a CORS origin mismatch.

`http://localhost:5173` and `http://127.0.0.1:5173` are different origins.
If frontend runs on `127.0.0.1`, backend must allow that origin too.

Recommended backend env value:

```bash
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

Quick check:
- backend health: `http://localhost:3001/health`
- warehouses API: `http://localhost:3001/warehouses`

## Troubleshooting: "Database operation failed" in UI

This means frontend reached API, but API could not complete a DB query.

1. Check API health:
   - `curl http://localhost:3001/health`
2. Check DB-backed endpoint:
   - `curl http://localhost:3001/warehouses`
3. Verify API DB config in `.env`:

```bash
DATABASE_URL=postgresql://warehouse:warehouse@localhost:5432/warehouse_crm
```

4. Confirm Postgres is running:
   - `docker compose ps`

If DB is unreachable or misconfigured, API prints a startup error in the terminal and exits with a clear message.
