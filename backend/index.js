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

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

db.query("SELECT NOW()")
  .then(() => {
    console.log("✅ PostgreSQL Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL Connection Failed");
    console.error(err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/wards", wardRoutes);
app.use("/api/roads", roadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/bom", bomRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/summary", summaryRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Gold Cobra Backend Running",
    version: "1.0.0"
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Not Found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server Running on http://localhost:${PORT}`);
});