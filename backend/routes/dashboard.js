const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// GET Dashboard
router.get(
  "/",
  dashboardController.getDashboardData
);

// Update Milestone — admin only
router.put(
  "/update-milestone",
  verifyToken,
  requireAdmin,
  dashboardController.updateMilestone
);

module.exports = router;
