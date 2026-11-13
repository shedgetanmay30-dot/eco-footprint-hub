
const express = require("express");
const router = express.Router();

const {
  createChallenge,
  getChallenges,
  updateChallenge,
  deleteChallenge,
  joinChallenge,
  getMyChallenges,
  checkInChallenge
} = require("../controllers/challengeController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// ===================================
// ADMIN ROUTES
// ===================================

// Create challenge
router.post("/", protect, admin, createChallenge);

// Update challenge
router.put("/:id", protect, admin, updateChallenge);

// Delete challenge
router.delete("/:id", protect, admin, deleteChallenge);


// ===================================
// USER ROUTES
// ===================================

// Get all active challenges
router.get("/", protect, getChallenges);

// Get logged-in user's challenges
router.get("/my", protect, getMyChallenges);

// Join a challenge
router.post("/:id/join", protect, joinChallenge);

// Daily check-in for General challenges
router.post("/:id/check-in", protect, checkInChallenge);

module.exports = router;
