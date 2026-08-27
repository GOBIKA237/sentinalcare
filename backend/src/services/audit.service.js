const db = require("../config/db");
const logger = require("../utils/logger");

/**
 * Writes one row to audit_log. Called on every access — allowed or denied —
 * to anything sensitive: individual risk scores, another user's check-ins,
 * and always for note decryption attempts. Never throws into the request
 * path; an audit-logging failure shouldn't be what breaks the API, but it
 * IS logged loudly so it gets noticed.
 */
async function record({ actorUserId, action, targetUserId = null, resourceId = null, allowed, metadata = {} }) {
  try {
    await db.query(
      `INSERT INTO audit_log (actor_user_id, action, target_user_id, resource_id, allowed, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [actorUserId, action, targetUserId, resourceId, allowed, metadata]
    );
  } catch (err) {
    logger.error("Failed to write audit_log entry", { action, err: err.message });
  }
}

module.exports = { record };
