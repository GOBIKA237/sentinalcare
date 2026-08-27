const express = require("express");
const gameController = require("../controllers/game.controller");
const { requireAuth } = require("../middleware/auth");
const { requireSelfOrRole } = require("../middleware/rbac");

const router = express.Router();

router.post("/sessions", requireAuth, gameController.submitSession);
router.get("/sessions/me", requireAuth, gameController.getMyGameHistory);

// Aggregate stats only — see game.service.js getAggregateHistory, which
// never selects reaction_times. Used for both self and elevated-role reads
// so raw per-tap telemetry has no route that can return it for anyone but
// the owner (owner uses /sessions/me above instead).
router.get(
  "/sessions/:userId",
  requireAuth,
  requireSelfOrRole("userId", "welfare_officer", "admin"),
  gameController.getUserGameHistory
);

module.exports = router;
