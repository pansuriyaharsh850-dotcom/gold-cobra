const db = require("../config/db");

// ==============================================
// GET Dashboard Data
// GET /api/dashboard?road=M.%20G.%20Road
// ==============================================
exports.getDashboardData = async (req, res) => {
  try {
    const { road } = req.query;

    if (!road) {
      return res.status(400).json({
        success: false,
        message: "Road name is required."
      });
    }

    // Get Road ID
    const roadResult = await db.query(
      "SELECT id, road_name, image_url FROM roads WHERE road_name = $1",
      [road]
    );

    if (roadResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Road not found."
      });
    }

    const roadId = roadResult.rows[0].id;
    const roadInfo = roadResult.rows[0];

    // ============================
    // Milestones
    // ============================
    const milestoneResult = await db.query(
      `
      SELECT
        id,
        milestone_name AS name,
        total_length AS target,
        achieved_length AS achieved,
        target_label,
        achieved_label,
        percentage_completed,
        TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date
      FROM project_milestones
      WHERE road_id = $1
      ORDER BY id;
      `,
      [roadId]
    );

    // ============================
    // Bill Of Materials
    // ============================
    const bomResult = await db.query(
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

    // ============================
    // Material Overview
    // ============================
    const materialResult = await db.query(
      `
      SELECT
        id,
        mix_type,
        item_type,
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
      road: roadInfo,
      milestones: milestoneResult.rows,
      bom: bomResult.rows,
      mixOverview: materialResult.rows
    });

  } catch (err) {
    console.error("Dashboard Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==============================================
// UPDATE Milestone
// PUT /api/dashboard/update-milestone
// ==============================================
exports.updateMilestone = async (req, res) => {
  try {
    const {
      road,
      milestoneName,
      achievedLength
    } = req.body;

    if (!road || !milestoneName || achievedLength == null) {
      return res.status(400).json({
        success: false,
        message: "road, milestoneName and achievedLength are required."
      });
    }

    // Get Road ID
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
      UPDATE project_milestones
      SET
        achieved_length = $1,
        percentage_completed =
        CASE
          WHEN total_length = 0 THEN 0
          ELSE ROUND(($1::numeric / total_length) * 100, 2)
        END,
        updated_at = NOW()
      WHERE
        road_id = $2
        AND milestone_name = $3
      RETURNING *;
      `,
      [
        achievedLength,
        roadId,
        milestoneName
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found."
      });
    }

    res.json({
      success: true,
      message: "Milestone updated successfully.",
      milestone: result.rows[0]
    });

  } catch (err) {
    console.error("Update Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};