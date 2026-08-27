const db = require("../config/db");
const { encryptNote } = require("../utils/crypto");
const riskScoreService = require("./riskScore.service");

const RECENT_CHECKINS_FOR_SCORING = 7;

/**
 * Creates a check-in (encrypting the note), then recomputes a risk score
 * from the user's recent history and stores that too. In production this
 * risk-score step is Backend Dev 2's ML service call — see riskScore.service.js.
 */
async function createCheckin({ userId, mood, sleep, workload, note }) {
  const { ciphertext, iv, authTag } = encryptNote(note);

  const { rows } = await db.query(
    `INSERT INTO checkins (user_id, mood, sleep, workload, note_ciphertext, note_iv, note_auth_tag)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, mood, sleep, workload, created_at`,
    [userId, mood, sleep, workload, ciphertext, iv, authTag]
  );
  const checkin = rows[0];

  const { rows: recent } = await db.query(
    `SELECT mood, sleep, workload FROM checkins
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, RECENT_CHECKINS_FOR_SCORING]
  );

  const { score, riskBand, factors } = riskScoreService.scoreFromCheckins(recent);

  const { rows: scoreRows } = await db.query(
    `INSERT INTO risk_scores (user_id, score, risk_band, factors)
     VALUES ($1, $2, $3, $4)
     RETURNING id, score, risk_band, factors, created_at`,
    [userId, score, riskBand, JSON.stringify(factors)]
  );

  return { checkin, riskScore: scoreRows[0] };
}

/**
 * Returns check-in history WITHOUT note text — safe for both the owner's
 * own trend chart and (with the right RBAC check upstream) a welfare
 * officer's view of an individual's numeric trend.
 */
async function getCheckinHistory(userId, limit = 30) {
  const { rows } = await db.query(
    `SELECT id, mood, sleep, workload, created_at
     FROM checkins
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

async function getLatestRiskScore(userId) {
  const { rows } = await db.query(
    `SELECT id, score, risk_band, factors, created_at
     FROM risk_scores
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

module.exports = { createCheckin, getCheckinHistory, getLatestRiskScore };
