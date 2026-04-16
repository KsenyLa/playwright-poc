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

## API Endpoints

- `GET /health`
- `GET/POST /warehouses`
- `PUT/DELETE /warehouses/:id`
- `GET/POST /products`
- `PUT/DELETE /products/:id`
- `GET/POST /positions`
- `PUT/DELETE /positions/:id`
- `POST /migration/import-local`
- `DELETE /test/reset` (test-only, available for local E2E via test reset token)

Delete behavior:
- Deleting a warehouse/product that is referenced by positions returns `409`.

## Database Bootstrap and Seed Data

Docker Compose mounts SQL init scripts from `apps/api/db/init` into Postgres:
- `01_schema.sql` creates tables and constraints.
- `02_seed.sql` inserts starter warehouses/products/positions.

Important:
- Postgres init scripts run only when the data volume is created the first time.
- To re-run bootstrap scripts, use:

```bash
docker compose down -v && docker compose up -d
```

## Start Database in Docker

1. Ensure Docker Desktop is running.
2. From the project root, start Postgres:

```bash
docker compose up -d
```
Starts the Postgres container in detached mode.

3. Confirm container is healthy:

```bash
docker compose ps
```

4. Optional: watch DB startup logs:

```bash
docker compose logs -f postgres
```

5. Stop the database:

```bash
docker compose down
```
Stops and removes the running Docker Compose containers.

6. Recreate DB volume and rerun schema + seed scripts:

```bash
docker compose down -v && docker compose up -d
```
Removes containers and volumes, then starts Postgres again so bootstrap SQL runs from scratch.

## Setup

1. Install dependencies

```bash
npm install
```

2. Copy env values

```bash
cp .env.example .env
```

3. Start Postgres (with schema + seed bootstrap on first run)

```bash
docker compose up -d
```

## Run

Run both backend + frontend:

```bash
npm run dev
```

Or separately:

```bash
npm run dev:api
npm run dev:web
```

Frontend: `http://localhost:5173`
API: `http://localhost:3001`

`npm run dev:api` auto-loads env values from the root `.env`.

## Data Source

The web app now reads and writes data only through the backend API (DB-backed).
Local browser storage is not used for app data anymore.
`POST /migration/import-local` is available as an optional manual migration endpoint.

## Testing

### API tests

```bash
npm run test:api
```

Requires `DATABASE_URL` and an initialized Postgres DB.

### Playwright E2E tests

```bash
npm run test:e2e
```

Playwright starts:
- API (`npm run dev:api`) and waits for `/health`
- Web (`npm run dev:web`)

## Scripts

- `npm run dev`
- `npm run dev:web`
- `npm run dev:api`
- `npm run build`
- `npm run preview`
- `npm run test:e2e`
- `npm run test:api`
- `docker compose up -d`
- `docker compose down`
- `docker compose down -v && docker compose up -d`

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

If DB is unreachable/misconfigured, API now prints startup error in terminal and exits with a clear message.
