const auditService = require("../services/audit.service");

/**
 * requireRole('admin', 'welfare_officer') -> only those roles may proceed.
 * Must run AFTER requireAuth (needs req.user).
 * Denials are audit-logged so repeated probing shows up in the trail.
 */
function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      await auditService.record({
        actorUserId: req.user.id,
        action: `rbac.denied:${req.method}:${req.originalUrl}`,
        allowed: false,
        metadata: { requiredRoles: allowedRoles, actualRole: req.user.role },
      });
      return res.status(403).json({ error: "Insufficient role for this action" });
    }

    next();
  };
}

/**
 * Allows a request if the caller is hitting their OWN resource (:userId param
 * matches req.user.id) OR has one of the given elevated roles. Use this for
 * routes like GET /users/:userId that a soldier should reach for themself,
 * and welfare_officer/admin should reach for anyone.
 */
function requireSelfOrRole(paramName, ...elevatedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const targetId = req.params[paramName];
    const isSelf = targetId === req.user.id;
    const isElevated = elevatedRoles.includes(req.user.role);

    if (!isSelf && !isElevated) {
      await auditService.record({
        actorUserId: req.user.id,
        targetUserId: targetId,
        action: `rbac.denied:${req.method}:${req.originalUrl}`,
        allowed: false,
        metadata: { elevatedRoles },
      });
      return res.status(403).json({ error: "Not authorized to access this resource" });
    }

    next();
  };
}

module.exports = { requireRole, requireSelfOrRole };
