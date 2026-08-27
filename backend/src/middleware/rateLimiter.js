const rateLimit = require("express-rate-limit");
const env = require("../config/env");

/**
 * Acts as the API-gateway layer for the hackathon build: global request
 * throttling here in Express, edge-level reverse proxying + its own rate
 * limiting in nginx (see nginx/nginx.conf). A dedicated gateway (Kong etc.)
 * would replace this in a production deployment.
 */
const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again shortly." },
});

// Auth endpoints get a tighter limit to slow down credential stuffing / brute force.
const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts, please try again shortly." },
});

module.exports = { generalLimiter, authLimiter };
