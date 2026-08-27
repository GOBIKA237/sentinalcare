const logger = require("../utils/logger");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.originalUrl });

  const status = err.status || 500;
  const message =
    status === 500 ? "Internal server error" : err.message || "Request failed";

  res.status(status).json({ error: message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: "Route not found" });
}

module.exports = { errorHandler, notFoundHandler };
