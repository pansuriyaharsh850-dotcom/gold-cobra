const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

// Login

router.post(
  "/login",
  authController.login
);

// Current User

router.get(
  "/me",
  verifyToken,
  authController.me
);

module.exports = router;
