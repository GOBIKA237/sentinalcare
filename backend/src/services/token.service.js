const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const env = require("../config/env");
const db = require("../config/db");

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, unit: user.unit },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Issues a new refresh token, stores its HASH (never the raw token) in
 * refresh_tokens, and returns the raw token to send to the client.
 */
async function issueRefreshToken(userId) {
  const jti = uuidv4();
  const token = jwt.sign({ sub: userId, jti }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });

  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);

  await db.query(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [jti, userId, hashToken(token), expiresAt]
  );

  return token;
}

/**
 * Verifies a refresh token against its stored hash, and rotates it:
 * the old one is revoked and a new one is issued. Rejects reused/revoked
 * tokens outright (protects against refresh-token replay).
 */
async function rotateRefreshToken(rawToken) {
  let decoded;
  try {
    decoded = jwt.verify(rawToken, env.jwt.refreshSecret);
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }

  const { rows } = await db.query(
    `SELECT * FROM refresh_tokens WHERE id = $1`,
    [decoded.jti]
  );
  const record = rows[0];

  if (!record || record.revoked || record.token_hash !== hashToken(rawToken)) {
    throw new Error("Refresh token not recognized or already used");
  }

  await db.query(`UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1`, [
    decoded.jti,
  ]);

  const newRefreshToken = await issueRefreshToken(decoded.sub);
  return { userId: decoded.sub, newRefreshToken };
}

async function revokeAllRefreshTokens(userId) {
  await db.query(
    `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1 AND revoked = FALSE`,
    [userId]
  );
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeAllRefreshTokens,
};
