const db = require("../config/db");

// ==============================================
// GET All Milestones by Road
// GET /api/milestones?road=M.%20G.%20Road
// ==============================================
exports.getMilestones = async (req, res) => {
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

    res.json({
      success: true,
      milestones: result.rows
    });

  } catch (err) {

    console.error("Get Milestones Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

// ==============================================
// GET Milestone By ID
// GET /api/milestones/:id
// ==============================================
exports.getMilestoneById = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await db.query(
      `
      SELECT
        id,
        road_id,
        milestone_name,
        total_length,
        achieved_length,
        percentage_completed,
        TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
        updated_at
      FROM project_milestones
      WHERE id = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found."
      });
    }

    res.json({
      success: true,
      milestone: result.rows[0]
    });

  } catch (err) {

    console.error("Get Milestone Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

// ==============================================
// ADD Milestone
// POST /api/milestones
// ==============================================
exports.addMilestone = async (req, res) => {

  try {

    const {
      road,
      milestoneName,
      totalLength,
      achievedLength,
      targetLabel,
      achievedLabel,
      startDate,
      endDate
    } = req.body;

    if (!road || !milestoneName || totalLength == null || achievedLength == null) {
      return res.status(400).json({
        success: false,
        message: "road, milestoneName, totalLength and achievedLength are required."
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

    const percentage =
      Number(totalLength) === 0
        ? 0
        : Number(((achievedLength / totalLength) * 100).toFixed(2));

    const result = await db.query(
      `
      INSERT INTO project_milestones
      (
        road_id,
        milestone_name,
        total_length,
        achieved_length,
        percentage_completed,
        target_label,
        achieved_label,
        start_date,
        end_date
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
      RETURNING
        id,
        road_id,
        milestone_name,
        total_length,
        achieved_length,
        percentage_completed,
        target_label,
        achieved_label,
        TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date;
      `,
      [
        roadId,
        milestoneName,
        totalLength,
        achievedLength,
        percentage,
        targetLabel || `${totalLength}m`,
        achievedLabel || `${achievedLength}m`,
        startDate || null,
        endDate || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Milestone added successfully.",
      milestone: result.rows[0]
    });

  } catch (err) {

    console.error("Add Milestone Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

// ==============================================
// UPDATE Milestone
// PUT /api/milestones
// ==============================================
exports.updateMilestone = async (req, res) => {

  try {

    const {
      road,
      milestoneName,
      totalLength,
      achievedLength,
      targetLabel,
      achievedLabel,
      startDate,
      endDate
    } = req.body;

    if (!road || !milestoneName || achievedLength == null) {
      return res.status(400).json({
        success: false,
        message: "road, milestoneName and achievedLength are required."
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
      UPDATE project_milestones
      SET
        total_length = COALESCE($1, total_length),
        achieved_length = $2,
        target_label = COALESCE($5, target_label),
        achieved_label = COALESCE($6, achieved_label),
        start_date = COALESCE($7, start_date),
        end_date = COALESCE($8, end_date),
        percentage_completed =
          CASE
            WHEN COALESCE($1, total_length) = 0 THEN 0
            ELSE ROUND(($2::numeric / COALESCE($1, total_length)) * 100, 2)
          END,
        updated_at = NOW()
      WHERE
        road_id = $3
        AND milestone_name = $4
      RETURNING
        id,
        road_id,
        milestone_name,
        total_length,
        achieved_length,
        percentage_completed,
        target_label,
        achieved_label,
        TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
        TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date;
      `,
      [
        totalLength ?? null,
        achievedLength,
        roadId,
        milestoneName,
        targetLabel || null,
        achievedLabel || null,
        startDate || null,
        endDate || null
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

    console.error("Update Milestone Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

// ==============================================
// DELETE Milestone
// DELETE /api/milestones/:id
// ==============================================
exports.deleteMilestone = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM project_milestones WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found."
      });
    }

    res.json({
      success: true,
      message: "Milestone deleted successfully."
    });

  } catch (err) {

    console.error("Delete Milestone Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};