
const express = require("express");
const router = express.Router();

const {
  getLeaderboard
} = require("../controllers/leaderboardController");

const protect = require("../middleware/authMiddleware");

// =====================================
// LEADERBOARD ROUTES
// =====================================

// Get top 10 users and logged-in user's rank
router.get("/", protect, getLeaderboard);

module.exports = router;
