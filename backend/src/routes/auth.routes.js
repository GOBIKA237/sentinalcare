const express = require("express");
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/login", authLimiter, authController.login);
router.post("/refresh", authLimiter, authController.refresh);
router.post("/logout", requireAuth, authController.logout);

module.exports = router;
