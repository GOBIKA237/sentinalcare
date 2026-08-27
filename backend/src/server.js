const app = require("./app");
const env = require("./config/env");
const logger = require("./utils/logger");

app.listen(env.port, () => {
  logger.info(`SentinelCare core API listening on port ${env.port} (${env.nodeEnv})`);
});
