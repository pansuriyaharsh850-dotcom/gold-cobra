const db = require("../config/db");

// ==============================================
// GET Materials by Road
// GET /api/materials?road=M.%20G.%20Road
// ==============================================
exports.getMaterials = async (req, res) => {
  try {
    const { road } = req.query;

    if (!road) {
      return res.status(400).json({
        success: false,
        message: "Road name is required."
      });
    }

    const roadResult = await db.query(
      "SELECT id FROM roads WHERE road_name = $1",
      [road]
    );

    if (roadResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Road not found."
      });
    }

    const roadId = roadResult.rows[0].id;

    const result = await db.query(
      `
      SELECT
        id,
        road_id,
        mix_type,
        item_type,
        quantity,
        total_sum,
        CONCAT(mix_type,' ',item_type) AS name,
        quantity AS value
      FROM material_overview
      WHERE road_id = $1
      ORDER BY id;
      `,
      [roadId]
    );

    res.json({
      success: true,
      materials: result.rows
    });

  } catch (err) {

    console.error("Get Materials Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

// ==============================================
// GET Material By ID
// GET /api/materials/:id
// ==============================================
exports.getMaterialById = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await db.query(
      `
      SELECT
        id,
        road_id,
        mix_type,
        item_type,
        quantity,
        total_sum
      FROM material_overview
      WHERE id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Material not found."
      });
    }

    res.json({
      success: true,
      material: result.rows[0]
    });

  } catch (err) {

    console.error("Get Material Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

// ==============================================
// ADD Material
// POST /api/materials
// ==============================================
exports.addMaterial = async (req, res) => {

  try {

    const {
      road,
      mixType,
      itemType,
      quantity,
      totalSum
    } = req.body;

    if (!road || !mixType || !itemType || quantity == null) {
      return res.status(400).json({
        success: false,
        message: "road, mixType, itemType and quantity are required."
      });
    }

    const roadResult = await db.query(
      "SELECT id FROM roads WHERE road_name = $1",
      [road]
    );

    if (roadResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Road not found."
      });
    }

    const roadId = roadResult.rows[0].id;

    const result = await db.query(
      `
      INSERT INTO material_overview
      (
        road_id,
        mix_type,
        item_type,
        quantity,
        total_sum
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      RETURNING *;
      `,
      [
        roadId,
        mixType,
        itemType,
        quantity,
        totalSum || 0
      ]
    );

    res.status(201).json({
      success: true,
      message: "Material added successfully.",
      material: result.rows[0]
    });

  } catch (err) {

    console.error("Add Material Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

// ==============================================
// UPDATE Material
// PUT /api/materials/:id
// ==============================================
exports.updateMaterial = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      mixType,
      itemType,
      quantity,
      totalSum
    } = req.body;

    const result = await db.query(
      `
      UPDATE material_overview
      SET
        mix_type = $1,
        item_type = $2,
        quantity = $3,
        total_sum = $4
      WHERE id = $5
      RETURNING *;
      `,
      [
        mixType,
        itemType,
        quantity,
        totalSum || 0,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Material not found."
      });
    }

    res.json({
      success: true,
      message: "Material updated successfully.",
      material: result.rows[0]
    });

  } catch (err) {

    console.error("Update Material Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

// ==============================================
// DELETE Material
// DELETE /api/materials/:id
// ==============================================
exports.deleteMaterial = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM material_overview WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Material not found."
      });
    }

    res.json({
      success: true,
      message: "Material deleted successfully."
    });

  } catch (err) {

    console.error("Delete Material Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};
