const express = require("express");
const router = express.Router();

const roadController = require("../controllers/roadController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// Create — admin only
router.post("/", verifyToken, requireAdmin, roadController.createRoad);

// Set road image (by road name) — admin only
// Placed before "/:id" so "/image" isn't swallowed as an :id param
router.put("/image", verifyToken, requireAdmin, roadController.updateRoadImage);

// Read
router.get("/", roadController.getRoads);
router.get("/ward/:ward", roadController.getRoadsByWard);
router.get("/:id", roadController.getRoad);

// Update — admin only
router.put("/:id", verifyToken, requireAdmin, roadController.updateRoad);

// Delete — admin only
router.delete("/:id", verifyToken, requireAdmin, roadController.deleteRoad);

module.exports = router;
