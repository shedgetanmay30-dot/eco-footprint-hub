
const express = require("express");
const router = express.Router();

const activityController = require("../controllers/activityController");
const protect = require("../middleware/authMiddleware");

// Add activity
router.post("/", protect, activityController.addActivity);

// Get logged-in user's activities
router.get("/", protect, activityController.getActivities);

// Get total carbon emissions
router.get("/total-emission", protect, activityController.getActivityEmission);

// Get activity statistics
router.get("/stats", protect, activityController.getActivityStats);

// Delete activity
router.delete("/:id", protect, activityController.deleteActivity);

module.exports = router;
