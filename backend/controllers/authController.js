const db = require("../config/db");
const jwt = require("jsonwebtoken");

// ===================================
// LOGIN
// POST /api/auth/login
// ===================================

exports.login = async (req, res) => {
  try {

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and Password are required",
      });
    }

    const result = await db.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid Username",
      });
    }

    const user = result.rows[0];

    // Plain password check
    if (password !== user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res.json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// ===================================
// GET CURRENT USER
// GET /api/auth/me
// ===================================

exports.me = async (req, res) => {

  try {

    const result = await db.query(
      "SELECT id,username,role FROM users WHERE id=$1",
      [req.user.id]
    );

    res.json(result.rows[0]);

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};
