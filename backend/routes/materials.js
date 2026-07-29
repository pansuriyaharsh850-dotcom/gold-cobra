const express = require("express");
const router = express.Router();

const materialController = require("../controllers/materialController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");


// ==============================================
// GET Material Overview by Road
// GET /api/materials?road=M.%20G.%20Road
// ==============================================
router.get(
  "/",
  materialController.getMaterials
);


// ==============================================
// GET Material By ID
// GET /api/materials/:id
// ==============================================
router.get(
  "/:id",
  materialController.getMaterialById
);


// ==============================================
// ADD Material — admin only
// POST /api/materials
// ==============================================
router.post(
  "/",
  verifyToken,
  requireAdmin,
  materialController.addMaterial
);


// ==============================================
// UPDATE Material — admin only
// PUT /api/materials/:id
// ==============================================
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  materialController.updateMaterial
);


// ==============================================
// DELETE Material — admin only
// DELETE /api/materials/:id
// ==============================================
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  materialController.deleteMaterial
);


module.exports = router;
