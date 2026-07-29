const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {

    res.status(401).json({
      success: false,
      message: "Invalid Token",
    });

  }
};

// ==============================================
// Only allows requests through when the logged-in
// user's role is "admin". Must run AFTER verifyToken,
// since it reads req.user set by that middleware.
// ==============================================
exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required for this action.",
    });
  }

  next();
};
