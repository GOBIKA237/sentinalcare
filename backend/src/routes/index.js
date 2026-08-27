const express = require("express");
const authRoutes = require("./auth.routes");
const usersRoutes = require("./users.routes");
const checkinsRoutes = require("./checkins.routes");
const alertsRoutes = require("./alerts.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/checkins", checkinsRoutes);
router.use("/alerts", alertsRoutes);

router.get("/health", (req, res) => res.json({ status: "ok" }));

module.exports = router;
