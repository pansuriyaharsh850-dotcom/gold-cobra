const express = require("express");
const router = express.Router();

const summaryController = require("../controllers/summaryController");


// ==============================================
// GET Road Summary
// GET /api/summary?road=M.%20G.%20Road
// ==============================================
router.get(
  "/",
  summaryController.getSummary
);


module.exports = router;
