const db = require("../config/db");

// ==============================================
// SET Road Image (by road name) — admin only
// PUT /api/roads/image
// ==============================================
exports.updateRoadImage = async (req, res) => {
  try {
    const { road, imageUrl } = req.body;

    if (!road) {
      return res.status(400).json({
        success: false,
        message: "Road name is required."
      });
    }

    const result = await db.query(
      `
      UPDATE roads
      SET image_url = $1
      WHERE road_name = $2
      RETURNING id, road_name, image_url;
      `,
      [imageUrl || null, road]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Road not found."
      });
    }

    res.json({
      success: true,
      message: "Road image updated successfully.",
      road: result.rows[0]
    });

  } catch (err) {
    console.error("Update Road Image Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==============================================
// CREATE Road
// POST /api/roads
// ==============================================
exports.createRoad = async (req, res) => {
  try {
    const { ward_id, road_name } = req.body;

    if (!ward_id || !road_name) {
      return res.status(400).json({
        success: false,
        message: "Ward ID and Road Name are required."
      });
    }

    const ward = await db.query(
      "SELECT id FROM wards WHERE id = $1",
      [ward_id]
    );

    if (ward.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ward not found."
      });
    }

    const duplicate = await db.query(
      `
      SELECT id
      FROM roads
      WHERE ward_id = $1
      AND road_name = $2;
      `,
      [ward_id, road_name]
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Road already exists in this ward."
      });
    }

    const result = await db.query(
      `
      INSERT INTO roads (ward_id, road_name)
      VALUES ($1, $2)
      RETURNING id, ward_id, road_name;
      `,
      [ward_id, road_name]
    );

    res.status(201).json({
      success: true,
      message: "Road created successfully.",
      road: result.rows[0]
    });

  } catch (err) {
    console.error("Create Road Error:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ==============================================
// GET All Roads
// GET /api/roads
// ==============================================
exports.getRoads = async (req, res) => {
  try {

    const result = await db.query(`
      SELECT
        r.id,
        r.ward_id,
        w.ward_number,
        r.road_name
      FROM roads r
      INNER JOIN wards w
      ON r.ward_id = w.id
      ORDER BY w.ward_number, r.road_name;
    `);

    res.json({
      success: true,
      roads: result.rows
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
// GET Road By ID
// GET /api/roads/:id
// ==============================================
exports.getRoad = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await db.query(`
      SELECT
        r.id,
        r.ward_id,
        w.ward_number,
        r.road_name
      FROM roads r
      INNER JOIN wards w
      ON r.ward_id = w.id
      WHERE r.id = $1;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Road not found."
      });
    }

    res.json({
      success: true,
      road: result.rows[0]
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
// GET Roads By Ward
// GET /api/roads/ward/:ward
// ==============================================
exports.getRoadsByWard = async (req, res) => {
  try {

    const { ward } = req.params;

    const result = await db.query(`
      SELECT
        r.id,
        w.ward_number,
        r.road_name
      FROM roads r
      INNER JOIN wards w
      ON r.ward_id = w.id
      WHERE w.ward_number = $1
      ORDER BY r.road_name;
    `, [ward]);

    res.json({
      success: true,
      roads: result.rows
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
// UPDATE Road
// PUT /api/roads/:id
// ==============================================
exports.updateRoad = async (req, res) => {
  try {

    const { id } = req.params;
    const { ward_id, road_name } = req.body;

    const result = await db.query(`
      UPDATE roads
      SET
        ward_id = $1,
        road_name = $2
      WHERE id = $3
      RETURNING *;
    `, [ward_id, road_name, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Road not found."
      });
    }

    res.json({
      success: true,
      message: "Road updated successfully.",
      road: result.rows[0]
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
// DELETE Road
// DELETE /api/roads/:id
// ==============================================
exports.deleteRoad = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await db.query(`
      DELETE FROM roads
      WHERE id = $1
      RETURNING id;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Road not found."
      });
    }

    res.json({
      success: true,
      message: "Road deleted successfully."
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
