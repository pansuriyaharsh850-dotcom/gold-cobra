require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const authRoutes = require("./routes/auth");
const wardRoutes = require("./routes/wards");
const roadRoutes = require("./routes/roads");
const dashboardRoutes = require("./routes/dashboard");
const milestoneRoutes = require("./routes/milestones");
const bomRoutes = require("./routes/bom");
const materialRoutes = require("./routes/materials");
const summaryRoutes = require("./routes/summary");

const app = express();

// =========================
// Middleware
// =========================

app.use(cors());

app.use(express.json({ limit: "5mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
  })
);

// =========================
// Check Route Imports
// =========================

console.log("Checking routes...");

const routes = {
  authRoutes,
  wardRoutes,
  roadRoutes,
  dashboardRoutes,
  milestoneRoutes,
  bomRoutes,
  materialRoutes,
  summaryRoutes,
};

Object.entries(routes).forEach(([name, route]) => {
  console.log(`${name}:`, typeof route);

  if (typeof route !== "function") {
    console.error(`❌ ERROR: ${name} is not a valid Express router`);
  }
});

// =========================
// PostgreSQL Connection
// =========================

db.query("SELECT NOW()")
  .then(() => {
    console.log("✅ PostgreSQL Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL Connection Failed");
    console.error(err.message);
  });

// =========================
// API Routes
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/wards", wardRoutes);
app.use("/api/roads", roadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/bom", bomRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/summary", summaryRoutes);

// =========================
// Health Check
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Gold Cobra Backend Running",
    version: "1.0.0",
  });
});

// =========================
// 404 Handler
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Not Found",
  });
});

// =========================
// Error Handler
// =========================

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// =========================
// Start Server
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server Running on port ${PORT}`);
});