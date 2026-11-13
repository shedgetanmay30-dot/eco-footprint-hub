const express = require("express");
const router = express.Router();

const {
  createTip,
  getTips,
  updateTip,
  deleteTip
} = require("../controllers/tipController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Admin routes
router.post("/", protect, admin, createTip);
router.put("/:id", protect, admin, updateTip);
router.delete("/:id", protect, admin, deleteTip);

// User route
router.get("/", protect, getTips);

module.exports = router;