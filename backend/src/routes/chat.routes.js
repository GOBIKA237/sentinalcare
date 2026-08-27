const express = require("express");
const chatController = require("../controllers/chat.controller");
const { requireAuth } = require("../middleware/auth");
const { requireSelfOrRole } = require("../middleware/rbac");

const router = express.Router();

router.post("/sessions", requireAuth, chatController.startSession);
router.post("/sessions/:id/messages", requireAuth, chatController.sendMessage);
router.get("/sessions/:id/messages", requireAuth, chatController.getMySessionMessages);

// Derived sentiment only — see chat.service.js getSentimentHistory. This is
// the one chat read welfare_officer/admin are allowed to reach; there is no
// equivalent route exposing message content for another user.
router.get(
  "/sentiment/:userId",
  requireAuth,
  requireSelfOrRole("userId", "welfare_officer", "admin"),
  chatController.getUserSentimentHistory
);

module.exports = router;
