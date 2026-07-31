const db = require("../config/db");

// ==============================================
// GET Bill Of Materials by Road
// GET /api/bom?road=M.%20G.%20Road
// ==============================================
exports.getBom = async (req, res) => {
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
        item_description AS item,
        item_category AS type,
        technical_specs AS specs,
        quantity AS qty,
        unit,
        unit_rate,
        total_cost,
        status_remarks AS status
      FROM bill_of_materials
      WHERE road_id = $1
      ORDER BY id;
      `,
      [roadId]
    );

    res.json({
      success: true,
      bom: result.rows
    });

  } catch (err) {

    console.error("BOM Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

// ==============================================
// GET Single BOM Item
// GET /api/bom/:id
// ==============================================
exports.getBomById = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await db.query(
      `
      SELECT
        id,
        road_id,
        item_description AS item,
        item_category AS type,
        technical_specs AS specs,
        quantity AS qty,
        unit,
        unit_rate,
        total_cost,
        status_remarks AS status
      FROM bill_of_materials
      WHERE id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "BOM item not found."
      });
    }

    res.json({
      success: true,
      bom: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

// ==============================================
// ADD BOM Item
// POST /api/bom
// ==============================================
exports.addBom = async (req, res) => {

  try {

    const {
      road,
      item,
      type,
      specs,
      qty,
      unit,
      unitRate,
      totalCost,
      status
    } = req.body;

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
      INSERT INTO bill_of_materials
      (
        road_id,
        item_description,
        item_category,
        technical_specs,
        quantity,
        unit,
        unit_rate,
        total_cost,
        status_remarks
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      RETURNING *;
      `,
      [
        roadId,
        item,
        type,
        specs,
        qty,
        unit,
        unitRate || 0,
        totalCost || 0,
        status
      ]
    );

    res.status(201).json({
      success: true,
      message: "BOM item added successfully.",
      bom: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

// ==============================================
// UPDATE BOM Item
// PUT /api/bom/:id
// ==============================================
exports.updateBom = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      item,
      type,
      specs,
      qty,
      unit,
      unitRate,
      totalCost,
      status
    } = req.body;

    const result = await db.query(
      `
      UPDATE bill_of_materials
      SET
        item_description = $1,
        item_category = $2,
        technical_specs = $3,
        quantity = $4,
        unit = $5,
        unit_rate = $6,
        total_cost = $7,
        status_remarks = $8
      WHERE id = $9
      RETURNING *;
      `,
      [
        item,
        type,
        specs,
        qty,
        unit,
        unitRate || 0,
        totalCost || 0,
        status,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "BOM item not found."
      });
    }

    res.json({
      success: true,
      message: "BOM updated successfully.",
      bom: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

// ==============================================
// DELETE BOM Item
// DELETE /api/bom/:id
// ==============================================
exports.deleteBom = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM bill_of_materials WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "BOM item not found."
      });
    }

    res.json({
      success: true,
      message: "BOM item deleted successfully."
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};
