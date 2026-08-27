const express = require("express");
const usersController = require("../controllers/users.controller");
const { requireAuth } = require("../middleware/auth");
const { requireSelfOrRole } = require("../middleware/rbac");

const router = express.Router();

router.get("/me", requireAuth, usersController.getMe);

// A soldier can fetch their own record; welfare_officer/admin can fetch anyone's.
router.get(
  "/:userId",
  requireAuth,
  requireSelfOrRole("userId", "welfare_officer", "admin"),
  usersController.getUserById
);

module.exports = router;
