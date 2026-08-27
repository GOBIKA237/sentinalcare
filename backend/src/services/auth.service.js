const bcrypt = require("bcryptjs");
const db = require("../config/db");

const SALT_ROUNDS = 12;

async function findUserByServiceNumber(serviceNumber) {
  const { rows } = await db.query(
    `SELECT u.*, r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.service_number = $1 AND u.is_active = TRUE`,
    [serviceNumber]
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const { rows } = await db.query(
    `SELECT u.id, u.service_number, u.display_name, u.email, u.unit, r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1 AND u.is_active = TRUE`,
    [id]
  );
  return rows[0] || null;
}

async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Creates a new user. Intended to be called from an admin-only onboarding
 * route (not included here — hackathon scope), or a seed script.
 */
async function createUser({ serviceNumber, displayName, email, password, roleName, unit }) {
  const passwordHash = await hashPassword(password);
  const { rows: roleRows } = await db.query(
    `SELECT id FROM roles WHERE name = $1`,
    [roleName]
  );
  if (!roleRows[0]) throw new Error(`Unknown role: ${roleName}`);

  const { rows } = await db.query(
    `INSERT INTO users (service_number, display_name, email, password_hash, role_id, unit)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, service_number, display_name, email, unit`,
    [serviceNumber, displayName, email, passwordHash, roleRows[0].id, unit]
  );
  return rows[0];
}

module.exports = {
  findUserByServiceNumber,
  findUserById,
  verifyPassword,
  hashPassword,
  createUser,
};
