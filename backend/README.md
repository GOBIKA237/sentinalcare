# SentinelCare — Core API, Auth & Gateway

Node.js + Express + PostgreSQL backend for SentinelCare (SIH26186). Owns auth,
RBAC, the user/checkin/risk-score schema, and the Docker Compose stack that
ties in Postgres, MinIO, the ML service, and nginx.

## Privacy design baked into this service

- Check-in **note text is encrypted at rest** (AES-256-GCM) — see `src/utils/crypto.js`.
- `mood` / `sleep` / `workload` are plain numbers (needed for trend charts and the
  ML risk model) — only the free-text `note` is encrypted.
- Welfare officers and admins get risk **scores and trends**, not raw note text.
  Decrypting a note requires an entry in the `escalations` table (admin-approved)
  — that workflow isn't wired up yet in this scaffold; wire it in
  `services/escalation.service.js` before anyone builds a "view note" button.
- Every access to another user's individual record, and every RBAC denial, is
  written to `audit_log` (see `services/audit.service.js`).

## Local setup

```bash
cp .env.example .env
# then edit .env:
#   - set real JWT_ACCESS_SECRET / JWT_REFRESH_SECRET (openssl rand -hex 32)
#   - set CHECKIN_ENCRYPTION_KEY (openssl rand -base64 32)

npm install
docker compose up -d postgres minio
npm run migrate      # applies src/db/migrations/*.sql
npm run dev           # starts the API on :4000
```

Full stack (once Backend Dev 2's ML service repo exists at
`../sentinelcare-ml-service`):

```bash
docker compose --profile with-ml up --build
```

Without the ML service repo yet, just run everything except it:

```bash
docker compose up --build node-api postgres minio nginx
```

## Endpoints implemented so far

| Method | Path                | Auth              | Notes                                   |
|--------|---------------------|-------------------|------------------------------------------|
| POST   | `/api/auth/login`   | none              | `{ serviceNumber, password }`             |
| POST   | `/api/auth/refresh` | none (refresh tok)| `{ refreshToken }`, rotates the token     |
| POST   | `/api/auth/logout`  | Bearer            | Revokes all refresh tokens for the user   |
| GET    | `/api/users/me`     | Bearer            | Current user's profile                    |
| GET    | `/api/users/:userId`| Bearer            | Self, or welfare_officer/admin — audited  |
| GET    | `/api/health`       | none              | Liveness check                            |

No user-creation endpoint yet on purpose — for the hackathon, seed test users
directly via `authService.createUser(...)` in a one-off script rather than
exposing open registration for a personnel system.

## What's intentionally NOT here yet (owned by teammates)

- `POST /api/checkins`, `GET /api/checkins/:userId` — coordinate with whoever's
  building the check-in write path; schema is ready (`checkins` table),
  handlers aren't written.
- `POST /score` calls to the ML service, and `risk_scores` writes — Backend Dev 2.
- HRMS ingestion, welfare alert engine, MinIO report storage — Backend Dev 3.
- The escalation approval flow that actually decrypts a note — needs an owner,
  flag this in standup.

## Environment variables

See `.env.example`. Generate secrets with:

```bash
openssl rand -hex 32        # JWT secrets
openssl rand -base64 32     # CHECKIN_ENCRYPTION_KEY
```
