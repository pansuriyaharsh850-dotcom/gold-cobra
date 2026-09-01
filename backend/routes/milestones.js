const express = require("express");

const router = express.Router();

const {
  getMilestones,
  getMilestoneById,
  addMilestone,
  updateMilestone,
  deleteMilestone
} = require("../controllers/milestoneController");

// GET /api/milestones?road=M.%20G.%20Road
router.get("/", getMilestones);

// GET /api/milestones/:id
router.get("/:id", getMilestoneById);

// POST /api/milestones
router.post("/", addMilestone);

// PUT /api/milestones
router.put("/", updateMilestone);

// DELETE /api/milestones/:id
router.delete("/:id", deleteMilestone);

module.exports = router;