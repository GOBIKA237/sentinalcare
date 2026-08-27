const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("Unexpected error on idle Postgres client", err);
  process.exit(1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
