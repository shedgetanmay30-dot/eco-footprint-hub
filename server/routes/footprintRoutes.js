
const express = require("express");

const router = express.Router();

const {
  calculateAndSaveFootprint,
  getFootprintHistory,
  getTotalFootprint
} = require("../controllers/footprintController");

const protect = require("../middleware/authMiddleware");

// Calculate and save footprint
router.post("/calculate", protect, calculateAndSaveFootprint);

// Get footprint history
router.get("/history", protect, getFootprintHistory);

// Get total footprint
router.get("/total", protect, getTotalFootprint);

module.exports = router;
