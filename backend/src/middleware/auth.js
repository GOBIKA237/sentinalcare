const tokenService = require("../services/token.service");

/**
 * Verifies the Bearer access token and attaches { id, role, unit } to req.user.
 * Everything downstream (RBAC, audit logging, ownership checks) relies on this.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  try {
    const decoded = tokenService.verifyAccessToken(token);
    req.user = { id: decoded.sub, role: decoded.role, unit: decoded.unit };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}

module.exports = { requireAuth };
