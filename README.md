# SentinelCare — Full Stack (Backend + Frontend)

SIH26186 — NEXAGEN. This is a working, testable slice of the app: login,
daily check-in, personal wellbeing trend, and a welfare-officer alert queue.
No ML teammate needed to test it — a simple explainable placeholder scorer
is wired into the backend so risk scores actually populate (see
`backend/src/services/riskScore.service.js`; swap it for the real ML service
call later, the seam is already there).

## 0. Prerequisites

- Node.js 18+ and npm
- Docker + Docker Compose (for Postgres — easiest path) OR a local Postgres 16 install

## 1. Start the database

From `backend/`:

```bash
cd backend
cp .env.example .env
```

Open `.env` and set real values for:
- `JWT_ACCESS_SECRET` — generate with `openssl rand -hex 32`
- `JWT_REFRESH_SECRET` — generate a *different* one the same way
- `CHECKIN_ENCRYPTION_KEY` — generate with `openssl rand -base64 32`

Then start Postgres (and MinIO, though nothing uses it yet):

```bash
docker compose up -d postgres minio
```

## 2. Run the backend

```bash
npm install
npm run migrate    # creates all tables
npm run seed       # creates 3 test accounts (see below)
npm run dev         # starts API on http://localhost:4000
```

Confirm it's up: `curl http://localhost:4000/api/health` → `{"status":"ok"}`

### Test accounts (created by `npm run seed`)

| Service number | Password      | Role            |
|-----------------|--------------|-----------------|
| `soldier1`      | Password123! | soldier         |
| `welfare1`      | Password123! | welfare_officer |
| `admin1`        | Password123! | admin           |

## 3. Run the frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev          # starts on http://localhost:5173
```

Open http://localhost:5173, log in as `soldier1` to log a check-in and see
your trend, or as `welfare1` to see the alert queue populate once a couple
of check-ins have pushed someone into "moderate" or "high" risk.

## 4. What to actually test end-to-end

1. Log in as `soldier1` → submit a check-in with low mood/sleep and high
   workload a few times in a row (edit and resubmit — there's no "one per
   day" lock in this build, intentionally, so you can generate a trend fast
   for a demo).
2. Log in as `welfare1` → the alert queue should show `soldier1` once their
   rolling risk score crosses into "moderate" or "high".
3. Log in as `soldier1` again → the "My wellbeing" tab should show the
   trend chart and the latest risk band.

## What's real vs. placeholder right now

**Real:** auth (JWT + refresh rotation), RBAC, Postgres schema, encrypted
check-in notes at rest, audit logging on cross-user reads, the full
check-in → risk-score → alert-queue pipeline, and a working React frontend
wired to all of it.

**Placeholder, flagged clearly in code comments:**
- `backend/src/services/riskScore.service.js` — simple weighted-average
  heuristic standing in for Backend Dev 2's scikit-learn service. Swap the
  function body for an HTTP call to `ML_SERVICE_URL` when that's ready.
- The `escalations` table exists in the schema but the actual "welfare
  officer requests to see a raw note, admin approves, note gets decrypted"
  workflow isn't wired to any routes yet.
- No HRMS ingestion (leave/deployment data) — Backend Dev 3's piece.
- No mobile (React Native) app — this frontend is the web version only,
  useful for both the personnel check-in flow and the officer dashboard for
  now; split mobile off from `frontend/src/pages/CheckInPage.jsx` later if
  time allows.

## Folder structure

```
sentinelcare-project/
├── backend/    Node.js + Express + PostgreSQL API (see backend/README.md)
└── frontend/   React + Vite + Tailwind web app
```

## If something doesn't start

- **`ECONNREFUSED` on the backend** → Postgres isn't up yet; check
  `docker compose ps` and give it a few seconds after `docker compose up -d`.
- **Frontend shows network errors** → confirm `VITE_API_BASE_URL` in
  `frontend/.env` matches where the backend is actually running
  (`http://localhost:4000/api` by default).
- **Login fails for the seed accounts** → make sure `npm run seed` actually
  ran against the same database the API is pointed at (same `.env`).
