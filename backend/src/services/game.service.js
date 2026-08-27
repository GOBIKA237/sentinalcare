const db = require("../config/db");

function computeStats(reactionTimes) {
  const n = reactionTimes.length;
  const avg = reactionTimes.reduce((s, t) => s + t, 0) / n;
  const variance = reactionTimes.reduce((s, t) => s + (t - avg) ** 2, 0) / n;
  return { avgReactionMs: avg, reactionVariance: variance };
}

/**
 * Stores a completed game session. avg_reaction_ms/reaction_variance are
 * computed server-side from the submitted reaction_times array, never
 * trusted from the client, so the aggregate a welfare_officer later reads
 * can't be spoofed independent of the raw taps.
 */
async function submitSession({ userId, reactionTimes, errorCount }) {
  const { avgReactionMs, reactionVariance } = computeStats(reactionTimes);

  const { rows } = await db.query(
    `INSERT INTO game_sessions (user_id, reaction_times, error_count, avg_reaction_ms, reaction_variance)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, error_count, avg_reaction_ms, reaction_variance, created_at`,
    [userId, reactionTimes, errorCount, avgReactionMs, reactionVariance]
  );
  return rows[0];
}

/**
 * Aggregate-only history — never selects reaction_times (the raw per-tap
 * telemetry). This is the query used for BOTH self and elevated-role reads;
 * there is deliberately no function anywhere that returns another user's
 * raw reaction_times.
 */
async function getAggregateHistory(userId, limit = 30) {
  const { rows } = await db.query(
    `SELECT id, error_count, avg_reaction_ms, reaction_variance, created_at
     FROM game_sessions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

/**
 * Full history including raw reaction_times — owner-only. Controller must
 * verify req.user.id === userId before calling this; never wire it to a
 * requireSelfOrRole(..., "welfare_officer", "admin") route.
 */
async function getOwnHistoryWithRaw(userId, limit = 30) {
  const { rows } = await db.query(
    `SELECT id, reaction_times, error_count, avg_reaction_ms, reaction_variance, created_at
     FROM game_sessions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

module.exports = { submitSession, getAggregateHistory, getOwnHistoryWithRaw };
