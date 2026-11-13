
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ============================================
// CORS CONFIGURATION
// ============================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://eco-footprint-hub.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// IMPORT ROUTES
// ============================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const footprintRoutes = require("./routes/footprintRoutes");
const activityRoutes = require("./routes/activityRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const tipRoutes = require("./routes/tipRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const badgeRoutes = require("./routes/badgeroutes");

// ============================================
// TEST ROUTES
// ============================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Eco Footprint Hub API"
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Eco Footprint Hub API is running",
    timestamp: new Date()
  });
});

// ============================================
// API ROUTES
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/footprint", footprintRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/tips", tipRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/badges", badgeRoutes);

// ============================================
// ERROR HANDLING
// ============================================

const {
  notFound,
  errorHandler
} = require("./middleware/errorMiddleware");

app.use(notFound);
app.use(errorHandler);

// ============================================
// START SERVER AFTER DATABASE CONNECTION
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log("----------------------------------");
      console.log("ECO FOOTPRINT HUB SERVER");
      console.log("----------------------------------");
      console.log(`Server running on port ${PORT}`);
      console.log("Vercel frontend: https://eco-footprint-hub.vercel.app");
      console.log("Health: /api/health");
      console.log("----------------------------------");
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
