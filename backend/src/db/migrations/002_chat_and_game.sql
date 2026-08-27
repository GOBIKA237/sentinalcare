-- Adds AI conversational check-in (chat) and reaction-time game data.
-- Design intent mirrors checkins/risk_scores: raw content (message text,
-- per-tap reaction times) is owner-only. welfare_officer/admin only ever see
-- a DERIVED score (derived_sentiment, game aggregate stats), never the
-- underlying transcript or per-tap telemetry. Decrypting a chat message is
-- meant to follow the same approve-then-decrypt shape as the existing
-- escalations table for checkin notes; that table is checkin-specific today
-- (escalations.checkin_id NOT NULL), so wiring chat into it is a follow-up
-- schema change, not done here. Until then there is no code path — approved
-- or otherwise — that decrypts chat_messages.

-- ---------- Chat sessions ----------
-- derived_sentiment/derived_sentiment_band are the ONLY chat-derived fields
-- welfare_officer/admin may read (see routes/chat.routes.js). They are
-- written by a scoring step over the session's messages, never copied from
-- message text itself.
CREATE TABLE chat_sessions (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at               TIMESTAMPTZ,
    derived_sentiment      NUMERIC(4,3) CHECK (derived_sentiment BETWEEN -1 AND 1),
    derived_sentiment_band VARCHAR(16) CHECK (derived_sentiment_band IN ('positive', 'neutral', 'negative')),
    sentiment_computed_at  TIMESTAMPTZ
);

CREATE INDEX idx_chat_sessions_user_id_started_at ON chat_sessions(user_id, started_at DESC);

-- ---------- Chat messages ----------
-- content_ciphertext/iv/auth_tag hold AES-256-GCM encrypted text, exactly
-- like checkins.note_ciphertext (see utils/crypto.js). owner-only, always.
CREATE TABLE chat_messages (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id         UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role               VARCHAR(16) NOT NULL CHECK (role IN ('user', 'assistant')),
    content_ciphertext BYTEA NOT NULL,
    content_iv         BYTEA NOT NULL,
    content_auth_tag   BYTEA NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_session_id_created_at ON chat_messages(session_id, created_at ASC);

-- ---------- Game sessions ----------
-- reaction_times is raw per-tap telemetry — owner-only, same as chat
-- message text. avg_reaction_ms/reaction_variance/error_count are the
-- aggregate fields welfare_officer/admin may read.
CREATE TABLE game_sessions (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_times     INTEGER[] NOT NULL,
    error_count        SMALLINT NOT NULL DEFAULT 0 CHECK (error_count >= 0),
    avg_reaction_ms    NUMERIC(7,2) NOT NULL,
    reaction_variance  NUMERIC(10,2) NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_game_sessions_user_id_created_at ON game_sessions(user_id, created_at DESC);
