const express = require("express");
const checkinsController = require("../controllers/checkins.controller");
const { requireAuth } = require("../middleware/auth");
const { requireSelfOrRole } = require("../middleware/rbac");

const router = express.Router();

router.post("/", requireAuth, checkinsController.createCheckin);
router.get("/me", requireAuth, checkinsController.getMyCheckins);
router.get(
  "/:userId",
  requireAuth,
  requireSelfOrRole("userId", "welfare_officer", "admin"),
  checkinsController.getUserCheckins
);

module.exports = router;
