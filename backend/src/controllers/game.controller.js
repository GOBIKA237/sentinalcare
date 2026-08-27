const gameService = require("../services/game.service");
const auditService = require("../services/audit.service");

async function submitSession(req, res, next) {
  try {
    const { reactionTimes, errorCount } = req.body;

    if (
      !Array.isArray(reactionTimes) ||
      reactionTimes.length === 0 ||
      !reactionTimes.every((t) => Number.isInteger(t) && t > 0)
    ) {
      return res
        .status(400)
        .json({ error: "reactionTimes must be a non-empty array of positive integers (ms)" });
    }
    if (!Number.isInteger(errorCount) || errorCount < 0) {
      return res.status(400).json({ error: "errorCount must be a non-negative integer" });
    }

    const session = await gameService.submitSession({
      userId: req.user.id,
      reactionTimes,
      errorCount,
    });
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

async function getMyGameHistory(req, res, next) {
  try {
    const history = await gameService.getOwnHistoryWithRaw(req.user.id);
    res.json({ history });
  } catch (err) {
    next(err);
  }
}

/**
 * Aggregate-only history. welfare_officer/admin reach this via
 * requireSelfOrRole in routes/game.routes.js. Deliberately calls
 * getAggregateHistory (never getOwnHistoryWithRaw) regardless of who's
 * asking, so raw reaction_times can never leak through this endpoint even
 * if the route wiring is ever loosened by mistake.
 */
async function getUserGameHistory(req, res, next) {
  try {
    const { userId } = req.params;
    const history = await gameService.getAggregateHistory(userId);

    if (req.user.id !== userId) {
      await auditService.record({
        actorUserId: req.user.id,
        targetUserId: userId,
        action: "game.aggregate.read",
        allowed: true,
      });
    }

    res.json({ history });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitSession, getMyGameHistory, getUserGameHistory };
