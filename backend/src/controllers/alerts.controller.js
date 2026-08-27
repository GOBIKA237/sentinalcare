const db = require("../config/db");

/**
 * Simple alert queue for welfare_officer/admin: most recent risk score per
 * user, joined with basic identity so an officer can act on it, filtered to
 * moderate/high. This is intentionally NOT joined against checkin note text.
 */
async function getAlertQueue(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT DISTINCT ON (rs.user_id)
              rs.user_id, u.display_name, u.unit,
              rs.score, rs.risk_band, rs.factors, rs.created_at
       FROM risk_scores rs
       JOIN users u ON u.id = rs.user_id
       WHERE rs.risk_band IN ('moderate', 'high')
       ORDER BY rs.user_id, rs.created_at DESC`
    );

    // Sort the deduped "latest score per user" list by severity for the UI.
    const bandWeight = { high: 2, moderate: 1, low: 0 };
    rows.sort((a, b) => bandWeight[b.risk_band] - bandWeight[a.risk_band]);

    res.json({ alerts: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAlertQueue };
