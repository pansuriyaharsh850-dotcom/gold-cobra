const express = require("express");
const router = express.Router();

const milestoneController = require("../controllers/milestoneController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");


// ==============================================
// GET All Milestones By Road
// GET /api/milestones?road=M.%20G.%20Road
// ==============================================
router.get(
  "/",
  milestoneController.getMilestones
);


// ==============================================
// GET Single Milestone
// GET /api/milestones/:id
// ==============================================
router.get(
  "/:id",
  milestoneController.getMilestoneById
);


// ==============================================
// ADD Milestone — admin only
// POST /api/milestones
// ==============================================
router.post(
  "/",
  verifyToken,
  requireAdmin,
  milestoneController.addMilestone
);


// ==============================================
// UPDATE Milestone — admin only
// PUT /api/milestones
// ==============================================
router.put(
  "/",
  verifyToken,
  requireAdmin,
  milestoneController.updateMilestone
);


// ==============================================
// DELETE Milestone — admin only
// DELETE /api/milestones/:id
// ==============================================
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  milestoneController.deleteMilestone
);


module.exports = router;
