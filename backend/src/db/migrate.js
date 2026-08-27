/**
 * Minimal migration runner for the hackathon: runs every .sql file in
 * db/migrations in filename order, inside a single transaction.
 * Good enough for a fixed, linear schema history like this one.
 */
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function migrate() {
  const dir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), "utf8");
      // eslint-disable-next-line no-console
      console.log(`Applying migration: ${file}`);
      await client.query(sql);
    }
    await client.query("COMMIT");
    // eslint-disable-next-line no-console
    console.log("Migrations applied successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    // eslint-disable-next-line no-console
    console.error("Migration failed, rolled back:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.pool.end();
  }
}

migrate();
