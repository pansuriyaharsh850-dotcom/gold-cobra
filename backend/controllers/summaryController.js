const db = require("../config/db");

// ==============================================
// GET Road Summary
// GET /api/summary?road=M.%20G.%20Road
// ==============================================
exports.getSummary = async (req, res) => {

  try {

    const { road } = req.query;

    if (!road) {
      return res.status(400).json({
        success: false,
        message: "Road name is required."
      });
    }

    const roadResult = await db.query(
      `
      SELECT
        r.id,
        r.road_name,
        w.ward_number
      FROM roads r
      INNER JOIN wards w
        ON r.ward_id = w.id
      WHERE r.road_name = $1;
      `,
      [road]
    );

    if (roadResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Road not found."
      });
    }

    const roadData = roadResult.rows[0];
    const roadId = roadData.id;

    const progressResult = await db.query(
      `
      SELECT
        COALESCE(SUM(total_length),0) AS total_length,
        COALESCE(SUM(achieved_length),0) AS completed_length
      FROM project_milestones
      WHERE road_id = $1;
      `,
      [roadId]
    );

    const totalLength = Number(progressResult.rows[0].total_length);
    const completedLength = Number(progressResult.rows[0].completed_length);

    const completion =
      totalLength === 0
        ? 0
        : Math.round((completedLength / totalLength) * 100);

    const bomResult = await db.query(
      `
      SELECT
        COUNT(*) AS total_items,
        COALESCE(SUM(total_cost),0) AS total_cost
      FROM bill_of_materials
      WHERE road_id = $1;
      `,
      [roadId]
    );

    const materialResult = await db.query(
      `
      SELECT
        COALESCE(SUM(quantity),0) AS total_quantity
      FROM material_overview
      WHERE road_id = $1;
      `,
      [roadId]
    );

    const equipmentResult = await db.query(
      `
      SELECT
        COUNT(*) AS equipment_count
      FROM equipment
      WHERE road_id = $1;
      `,
      [roadId]
    );

    const labourResult = await db.query(
      `
      SELECT
        COALESCE(SUM(total_workers),0) AS total_workers
      FROM labour
      WHERE road_id = $1;
      `,
      [roadId]
    );

    const progressCountResult = await db.query(
      `
      SELECT
        COUNT(*) AS total_days
      FROM daily_progress
      WHERE road_id = $1;
      `,
      [roadId]
    );

    res.json({

      success: true,

      road: {
        id: roadData.id,
        ward: roadData.ward_number,
        name: roadData.road_name
      },

      project: {
        totalLength,
        completedLength,
        completion
      },

      resources: {
        bomItems: Number(bomResult.rows[0].total_items),
        materialQuantity: Number(materialResult.rows[0].total_quantity),
        equipment: Number(equipmentResult.rows[0].equipment_count),
        labour: Number(labourResult.rows[0].total_workers),
        progressEntries: Number(progressCountResult.rows[0].total_days),
        totalCost: Number(bomResult.rows[0].total_cost)
      }

    });

  } catch (err) {

    console.error("Summary Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};
