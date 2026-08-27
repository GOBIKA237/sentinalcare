const checkinService = require("../services/checkin.service");
const auditService = require("../services/audit.service");

async function createCheckin(req, res, next) {
  try {
    const { mood, sleep, workload, note } = req.body;

    if (
      ![mood, sleep, workload].every(
        (v) => Number.isInteger(v) && v >= 1 && v <= 5
      )
    ) {
      return res
        .status(400)
        .json({ error: "mood, sleep, and workload must be integers 1-5" });
    }

    const result = await checkinService.createCheckin({
      userId: req.user.id,
      mood,
      sleep,
      workload,
      note,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getMyCheckins(req, res, next) {
  try {
    const history = await checkinService.getCheckinHistory(req.user.id);
    const latestRiskScore = await checkinService.getLatestRiskScore(req.user.id);
    res.json({ history, latestRiskScore });
  } catch (err) {
    next(err);
  }
}

/**
 * Welfare officer / admin viewing someone else's numeric trend + risk score.
 * Note text is never returned here — see README on the escalation workflow.
 */
async function getUserCheckins(req, res, next) {
  try {
    const { userId } = req.params;
    const history = await checkinService.getCheckinHistory(userId);
    const latestRiskScore = await checkinService.getLatestRiskScore(userId);

    if (req.user.id !== userId) {
      await auditService.record({
        actorUserId: req.user.id,
        targetUserId: userId,
        action: "checkins.read",
        allowed: true,
      });
    }

    res.json({ history, latestRiskScore });
  } catch (err) {
    next(err);
  }
}

module.exports = { createCheckin, getMyCheckins, getUserCheckins };
