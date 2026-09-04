const express = require("express");
const router = express.Router();

const bomController = require("../controllers/bomController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// GET All BOM Items by Road
router.get("/", bomController.getBom);

// GET Single BOM Item + logs
router.get("/:id", bomController.getBomById);

// ADD BOM Item — admin only
router.post("/", verifyToken, requireAdmin, bomController.addBom);

// UPDATE BOM Item — admin only
router.put("/:id", verifyToken, requireAdmin, bomController.updateBom);

// DELETE BOM Item — admin only
router.delete("/:id", verifyToken, requireAdmin, bomController.deleteBom);

// ==============================================
// LOG ROUTES (Detailed Daily Records)
// ==============================================

// ADD Log Entry to a BOM Item — admin only
router.post("/:id/logs", verifyToken, requireAdmin, bomController.addBomLog);

// DELETE Log Entry — admin only
router.delete("/logs/:logId", verifyToken, requireAdmin, bomController.deleteBomLog);

module.exports = router;