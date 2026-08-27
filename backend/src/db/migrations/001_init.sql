-- SentinelCare initial schema
-- Design intent: welfare_officer roles get risk SCORES and aggregate trends by
-- default. Raw check-in note text is encrypted at rest and only decryptable via
-- the escalation workflow (escalations table), which requires admin approval and
-- is always written to audit_log. This keeps "welfare-first, non-disciplinary"
-- baked into the data model, not just the app layer.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- Roles ----------
CREATE TABLE roles (
    id          SMALLSERIAL PRIMARY KEY,
    name        VARCHAR(32) UNIQUE NOT NULL CHECK (name IN ('soldier', 'welfare_officer', 'admin'))
);

INSERT INTO roles (name) VALUES ('soldier'), ('welfare_officer'), ('admin');

-- ---------- Users ----------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_number  VARCHAR(64) UNIQUE NOT NULL,   -- e.g. service/employee ID, not name
    display_name    VARCHAR(128) NOT NULL,
    email           VARCHAR(256) UNIQUE,
    password_hash   TEXT NOT NULL,
    role_id         SMALLINT NOT NULL REFERENCES roles(id),
    unit            VARCHAR(128),                  -- for aggregate/unit-level trend queries
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_unit ON users(unit);

-- ---------- Refresh tokens (rotation + revocation support) ----------
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL,           -- store a hash, never the raw token
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- ---------- Check-ins ----------
-- mood/sleep/workload are plain numeric (needed for trend charts / risk scoring).
-- note_ciphertext holds AES-256-GCM encrypted free text; note_iv and note_auth_tag
-- are required to decrypt it. Only the escalation workflow decrypts note text.
CREATE TABLE checkins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood            SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
    sleep           SMALLINT NOT NULL CHECK (sleep BETWEEN 1 AND 5),
    workload        SMALLINT NOT NULL CHECK (workload BETWEEN 1 AND 5),
    note_ciphertext BYTEA,
    note_iv         BYTEA,
    note_auth_tag   BYTEA,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_checkins_user_id_created_at ON checkins(user_id, created_at DESC);

-- ---------- Risk scores ----------
-- Written by the ML scoring service (via the Node API), never directly by a client.
CREATE TABLE risk_scores (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score       NUMERIC(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
    risk_band   VARCHAR(16) NOT NULL CHECK (risk_band IN ('low', 'moderate', 'high')),
    factors     JSONB NOT NULL DEFAULT '[]',   -- explainability output from ML service
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_scores_user_id_created_at ON risk_scores(user_id, created_at DESC);

-- ---------- Escalations ----------
-- The ONLY path by which a welfare_officer can request access to a check-in's
-- raw note text. Requires admin approval before the note is ever decrypted.
CREATE TABLE escalations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkin_id      UUID NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
    requested_by    UUID NOT NULL REFERENCES users(id),   -- welfare_officer
    reason          TEXT NOT NULL,
    status          VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    approved_by     UUID REFERENCES users(id),             -- admin
    decided_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Audit log ----------
-- Every read of sensitive data (raw notes, another user's individual record)
-- gets written here, whether allowed or denied.
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id   UUID REFERENCES users(id),
    action          VARCHAR(64) NOT NULL,       -- e.g. 'checkin.note.decrypt', 'user.read'
    target_user_id  UUID REFERENCES users(id),
    resource_id     UUID,
    allowed         BOOLEAN NOT NULL,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_actor ON audit_log(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_log_target ON audit_log(target_user_id, created_at DESC);
