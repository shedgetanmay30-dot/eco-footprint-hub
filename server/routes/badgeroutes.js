
const express = require("express");
const router = express.Router();

const {
  createBadge,
  getMyBadges,
  getAllBadges,
  deleteBadge
} = require("../controllers/badgecontroller");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// USER ROUTES

// Get logged-in user's earned and locked badges
router.get("/my", protect, getMyBadges);


// ADMIN ROUTES

// Get all badges
router.get("/", protect, admin, getAllBadges);

// Create a new badge
router.post("/", protect, admin, createBadge);

// Delete a badge
router.delete("/:id", protect, admin, deleteBadge);

module.exports = router;
