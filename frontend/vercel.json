require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const incidentRoutes = require("./src/routes/incidentRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| Environment Check
|--------------------------------------------------------------------------
*/

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing from .env");
} else {
  console.log("Gemini API key loaded");
}

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

connectDB();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://sentinel-ai-one-tau.vercel.app",
  "https://sentinel-ai-git-main-sakshi-kadavkar.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/

app.use(express.json());

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);

/*
|--------------------------------------------------------------------------
| API Test Route
|--------------------------------------------------------------------------
*/

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API routes are working"
  });
});

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to SentinelAI Backend",
    version: "1.0.0",
    status: "operational"
  });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  console.log("404 ROUTE NOT FOUND");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);

  res.status(404).json({
    success: false,
    message: "API route not found",
    method: req.method,
    url: req.originalUrl
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
  console.error("Server Error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SentinelAI Backend running on port ${PORT}`);
});