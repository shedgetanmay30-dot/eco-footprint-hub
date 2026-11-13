
const express = require("express");

const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
  getUserStatistics,
  getAllUsers,
  getSingleUser,
  deleteUser
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// =====================================
// USER ROUTES
// =====================================

// Get logged-in user's profile
router.get("/profile", protect, getUserProfile);

// Update logged-in user's profile
router.put("/profile", protect, updateUserProfile);

// Get logged-in user's statistics
router.get("/statistics", protect, getUserStatistics);


// =====================================
// ADMIN ROUTES
// =====================================

// Get all users
router.get("/", protect, admin, getAllUsers);

// Get a single user by ID
router.get("/:id", protect, admin, getSingleUser);

// Delete a user by ID
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
