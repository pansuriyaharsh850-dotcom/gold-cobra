const express = require("express");
const router = express.Router();

const wardController = require("../controllers/wardController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// ==============================================
// CREATE — admin only
// POST /api/wards
// ==============================================
router.post("/", verifyToken, requireAdmin, wardController.createWard);

// ==============================================
// READ ALL
// GET /api/wards
// ==============================================
router.get("/", wardController.getWards);

// ==============================================
// READ ONE
// GET /api/wards/:ward
// ==============================================
router.get("/:ward", wardController.getWard);

// ==============================================
// READ SUMMARY
// GET /api/wards/:ward/summary
// ==============================================
router.get("/:ward/summary", wardController.getWardSummary);

// ==============================================
// UPDATE — admin only
// PUT /api/wards/:id
// ==============================================
router.put("/:id", verifyToken, requireAdmin, wardController.updateWard);

// ==============================================
// DELETE — admin only
// DELETE /api/wards/:id
// ==============================================
router.delete("/:id", verifyToken, requireAdmin, wardController.deleteWard);

module.exports = router;
