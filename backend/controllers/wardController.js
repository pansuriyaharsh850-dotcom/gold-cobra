const db = require("../config/db");

// ==============================================
// CREATE Ward
// POST /api/wards
// ==============================================
exports.createWard = async (req, res) => {
  try {
    const { ward_number } = req.body;

    if (!ward_number) {
      return res.status(400).json({
        success: false,
        message: "Ward number is required."
      });
    }

    const checkWard = await db.query(
      `
      SELECT id
      FROM wards
      WHERE ward_number = $1;
      `,
      [ward_number]
    );

    if (checkWard.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Ward already exists."
      });
    }

    const result = await db.query(
      `
      INSERT INTO wards (ward_number)
      VALUES ($1)
      RETURNING id, ward_number;
      `,
      [ward_number]
    );

    res.status(201).json({
      success: true,
      message: "Ward created successfully.",
      ward: result.rows[0]
    });

  } catch (err) {
    console.error("Create Ward Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==============================================
// GET All Wards
// GET /api/wards
// ==============================================
exports.getWards = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        id,
        ward_number
      FROM wards
      ORDER BY ward_number;
      `
    );

    res.json({
      success: true,
      wards: result.rows
    });

  } catch (err) {
    console.error("Get Wards Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==============================================
// GET Ward By Number
// GET /api/wards/:ward
// ==============================================
exports.getWard = async (req, res) => {
  try {
    const { ward } = req.params;

    const result = await db.query(
      `
      SELECT
        r.id,
        w.ward_number,
        r.road_name
      FROM roads r
      INNER JOIN wards w
        ON r.ward_id = w.id
      WHERE w.ward_number = $1
      ORDER BY r.road_name;
      `,
      [ward]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ward not found."
      });
    }

    res.json({
      success: true,
      roads: result.rows
    });

  } catch (err) {
    console.error("Get Ward Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==============================================
// GET Ward Summary
// GET /api/wards/:ward/summary
// ==============================================
exports.getWardSummary = async (req, res) => {
  try {
    const { ward } = req.params;

    const wardResult = await db.query(
      `
      SELECT
        id,
        ward_number
      FROM wards
      WHERE ward_number = $1;
      `,
      [ward]
    );

    if (wardResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ward not found."
      });
    }

    const wardId = wardResult.rows[0].id;

    const roadsResult = await db.query(
      `
      SELECT COUNT(*) AS total_roads
      FROM roads
      WHERE ward_id = $1;
      `,
      [wardId]
    );

    const milestoneResult = await db.query(
      `
      SELECT
        COALESCE(SUM(pm.total_length),0) AS total_length,
        COALESCE(SUM(pm.achieved_length),0) AS completed_length
      FROM project_milestones pm
      INNER JOIN roads r
        ON pm.road_id = r.id
      WHERE r.ward_id = $1;
      `,
      [wardId]
    );

    const totalLength = Number(milestoneResult.rows[0].total_length);
    const completedLength = Number(milestoneResult.rows[0].completed_length);

    const completion =
      totalLength === 0
        ? 0
        : Math.round((completedLength / totalLength) * 100);

    const bomResult = await db.query(
      `
      SELECT COUNT(*) AS total_bom
      FROM bill_of_materials b
      INNER JOIN roads r
        ON b.road_id = r.id
      WHERE r.ward_id = $1;
      `,
      [wardId]
    );

    const materialResult = await db.query(
      `
      SELECT COALESCE(SUM(m.quantity),0) AS total_material
      FROM material_overview m
      INNER JOIN roads r
        ON m.road_id = r.id
      WHERE r.ward_id = $1;
      `,
      [wardId]
    );

    res.json({
      success: true,
      ward: {
        id: wardId,
        wardNumber: wardResult.rows[0].ward_number
      },
      summary: {
        totalRoads: Number(roadsResult.rows[0].total_roads),
        totalLength,
        completedLength,
        completion,
        bomItems: Number(bomResult.rows[0].total_bom),
        materialQuantity: Number(materialResult.rows[0].total_material)
      }
    });

  } catch (err) {
    console.error("Ward Summary Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==============================================
// UPDATE Ward
// PUT /api/wards/:id
// ==============================================
exports.updateWard = async (req, res) => {
  try {
    const { id } = req.params;
    const { ward_number } = req.body;

    if (!ward_number) {
      return res.status(400).json({
        success: false,
        message: "Ward number is required."
      });
    }

    const duplicate = await db.query(
      `
      SELECT id
      FROM wards
      WHERE ward_number = $1
      AND id <> $2;
      `,
      [ward_number, id]
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Ward number already exists."
      });
    }

    const result = await db.query(
      `
      UPDATE wards
      SET ward_number = $1
      WHERE id = $2
      RETURNING id, ward_number;
      `,
      [ward_number, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ward not found."
      });
    }

    res.json({
      success: true,
      message: "Ward updated successfully.",
      ward: result.rows[0]
    });

  } catch (err) {
    console.error("Update Ward Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==============================================
// DELETE Ward
// DELETE /api/wards/:id
// ==============================================
exports.deleteWard = async (req, res) => {
  try {
    const { id } = req.params;

    const roadCheck = await db.query(
      `
      SELECT id
      FROM roads
      WHERE ward_id = $1
      LIMIT 1;
      `,
      [id]
    );

    if (roadCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete ward because roads exist under this ward."
      });
    }

    const result = await db.query(
      `
      DELETE FROM wards
      WHERE id = $1
      RETURNING id;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ward not found."
      });
    }

    res.json({
      success: true,
      message: "Ward deleted successfully."
    });

  } catch (err) {
    console.error("Delete Ward Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
