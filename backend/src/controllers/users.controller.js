const authService = require("../services/auth.service");
const auditService = require("../services/audit.service");

async function getMe(req, res, next) {
  try {
    const user = await authService.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /users/:userId — reachable by the user themself, or by welfare_officer /
 * admin (enforced by requireSelfOrRole in the route). Any access by someone
 * other than the user themself is audit-logged.
 */
async function getUserById(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await authService.findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (req.user.id !== userId) {
      await auditService.record({
        actorUserId: req.user.id,
        targetUserId: userId,
        action: "user.read",
        allowed: true,
      });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, getUserById };
