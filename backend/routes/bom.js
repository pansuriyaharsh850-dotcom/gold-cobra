const express = require("express");
const router = express.Router();

const bomController = require("../controllers/bomController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");


// ==============================================
// GET All BOM Items by Road
// GET /api/bom?road=M.%20G.%20Road
// ==============================================
router.get(
  "/",
  bomController.getBom
);


// ==============================================
// GET Single BOM Item
// GET /api/bom/:id
// ==============================================
router.get(
  "/:id",
  bomController.getBomById
);


// ==============================================
// ADD BOM Item — admin only
// POST /api/bom
// ==============================================
router.post(
  "/",
  verifyToken,
  requireAdmin,
  bomController.addBom
);


// ==============================================
// UPDATE BOM Item — admin only
// PUT /api/bom/:id
// ==============================================
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  bomController.updateBom
);


// ==============================================
// DELETE BOM Item — admin only
// DELETE /api/bom/:id
// ==============================================
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  bomController.deleteBom
);


module.exports = router;
