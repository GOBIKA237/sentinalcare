const db = require("../config/db");
const { encryptNote, decryptNote } = require("../utils/crypto");
const sentimentService = require("./sentiment.service");

async function startSession(userId) {
  const { rows } = await db.query(
    `INSERT INTO chat_sessions (user_id)
     VALUES ($1)
     RETURNING id, user_id, started_at, ended_at`,
    [userId]
  );
  return rows[0];
}

/**
 * Returns the session row (or null) with only the columns needed for an
 * ownership check — never joins in messages here.
 */
async function getSessionOwner(sessionId) {
  const { rows } = await db.query(
    `SELECT id, user_id FROM chat_sessions WHERE id = $1`,
    [sessionId]
  );
  return rows[0] || null;
}

/**
 * Stores one message, encrypting content exactly like checkins.note (see
 * utils/crypto.js). Caller (controller) must have already verified the
 * requester owns this session — this function has no RBAC awareness.
 */
async function addMessage({ sessionId, role, content }) {
  const { ciphertext, iv, authTag } = encryptNote(content);

  const { rows } = await db.query(
    `INSERT INTO chat_messages (session_id, role, content_ciphertext, content_iv, content_auth_tag)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, session_id, role, created_at`,
    [sessionId, role, ciphertext, iv, authTag]
  );
  return rows[0];
}

/**
 * Decrypts and returns a session's own messages, in order. Owner-only —
 * the controller must enforce that before calling this. There is no
 * officer-facing equivalent of this function; that's intentional.
 */
async function getSessionMessages(sessionId) {
  const { rows } = await db.query(
    `SELECT id, role, content_ciphertext, content_iv, content_auth_tag, created_at
     FROM chat_messages
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId]
  );

  return rows.map((row) => ({
    id: row.id,
    role: row.role,
    content: decryptNote(row.content_ciphertext, row.content_iv, row.content_auth_tag),
    created_at: row.created_at,
  }));
}

/**
 * Ends a session and computes its derived_sentiment. Decrypts user messages
 * only transiently, inside this one function, to feed the scorer — the
 * plaintext is never returned or persisted, only { sentiment, band }.
 */
async function endSessionAndScore(sessionId) {
  const { rows } = await db.query(
    `SELECT content_ciphertext, content_iv, content_auth_tag
     FROM chat_messages
     WHERE session_id = $1 AND role = 'user'
     ORDER BY created_at ASC`,
    [sessionId]
  );

  const userMessages = rows.map((row) =>
    decryptNote(row.content_ciphertext, row.content_iv, row.content_auth_tag)
  );

  const { sentiment, band } = sentimentService.scoreFromMessages(userMessages);

  const { rows: updated } = await db.query(
    `UPDATE chat_sessions
     SET ended_at = now(), derived_sentiment = $2, derived_sentiment_band = $3, sentiment_computed_at = now()
     WHERE id = $1
     RETURNING id, user_id, started_at, ended_at, derived_sentiment, derived_sentiment_band`,
    [sessionId, sentiment, band]
  );
  return updated[0];
}

/**
 * Derived-sentiment-only history for a user's sessions. This is the ONLY
 * chat-related read exposed to welfare_officer/admin — no message content,
 * no session internals beyond the score. Safe for both self and elevated
 * roles per requireSelfOrRole upstream.
 */
async function getSentimentHistory(userId, limit = 30) {
  const { rows } = await db.query(
    `SELECT id, started_at, ended_at, derived_sentiment, derived_sentiment_band
     FROM chat_sessions
     WHERE user_id = $1 AND derived_sentiment IS NOT NULL
     ORDER BY started_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

module.exports = {
  startSession,
  getSessionOwner,
  addMessage,
  getSessionMessages,
  endSessionAndScore,
  getSentimentHistory,
};
