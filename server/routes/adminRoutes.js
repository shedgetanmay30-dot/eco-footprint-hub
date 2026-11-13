
const express = require("express");
const router = express.Router();

// Import admin controller functions
const {
  getDashboardStats,
  getAllFootprintRecords,
  getEmissionReport,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require("../controllers/adminController");

// Import analytics controller function
const {
  getAdminAnalytics
} = require("../controllers/adminAnalyticsController");

// Import middleware
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Check authentication and admin access for all routes
router.use(protect, admin);

// Dashboard statistics
router.get("/dashboard", getDashboardStats);

// All users' footprint records
router.get("/footprints", getAllFootprintRecords);

// Emission report
router.get("/emission-report", getEmissionReport);

// Advanced analytics
router.get("/analytics", getAdminAnalytics);

// Get all registered users
router.get("/users", getAllUsers);

// Update user role
router.put("/users/:id/role", updateUserRole);

// Delete user
router.delete("/users/:id", deleteUser);

module.exports = router;
