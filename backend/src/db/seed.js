/**
 * Creates three test accounts so you can log in and test the whole flow
 * without a signup screen. Run with: npm run seed
 *
 *   soldier1        / Password123!   (role: soldier)
 *   welfare1        / Password123!   (role: welfare_officer)
 *   admin1          / Password123!   (role: admin)
 */
const authService = require("../services/auth.service");
const db = require("../config/db");
const logger = require("../utils/logger");

async function upsertUser(user) {
  const existing = await authService.findUserByServiceNumber(user.serviceNumber);
  if (existing) {
    logger.info(`Skipping ${user.serviceNumber}, already exists`);
    return existing;
  }
  const created = await authService.createUser(user);
  logger.info(`Created ${user.serviceNumber} (${user.roleName})`);
  return created;
}

async function seed() {
  try {
    await upsertUser({
      serviceNumber: "soldier1",
      displayName: "Test Soldier",
      email: "soldier1@example.mil",
      password: "Password123!",
      roleName: "soldier",
      unit: "Alpha Company",
    });

    await upsertUser({
      serviceNumber: "welfare1",
      displayName: "Test Welfare Officer",
      email: "welfare1@example.mil",
      password: "Password123!",
      roleName: "welfare_officer",
      unit: "Alpha Company",
    });

    await upsertUser({
      serviceNumber: "admin1",
      displayName: "Test Admin",
      email: "admin1@example.mil",
      password: "Password123!",
      roleName: "admin",
      unit: "HQ",
    });

    logger.info("Seed complete.");
  } catch (err) {
    logger.error("Seed failed", { err: err.message });
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
}

seed();
