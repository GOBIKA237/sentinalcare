const express = require("express");
const alertsController = require("../controllers/alerts.controller");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

const router = express.Router();

router.get(
  "/",
  requireAuth,
  requireRole("welfare_officer", "admin"),
  alertsController.getAlertQueue
);

module.exports = router;
