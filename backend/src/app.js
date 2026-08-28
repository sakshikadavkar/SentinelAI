const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to SentinelAI Backend API 🚀",
    version: "1.0.0",
  });
});

// Authentication Routes
app.use("/api/auth", authRoutes);

module.exports = app;