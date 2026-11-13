
const mongoose = require("mongoose");

// =====================================
// USER SCHEMA
// =====================================

const userSchema = new mongoose.Schema(
  {
    // BASIC USER INFORMATION
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address"
      ]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false
    },

    // USER ROLE
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    // ECO REWARD POINTS
    points: {
      type: Number,
      default: 0,
      min: 0
    },

    // ENVIRONMENTAL SCORE
    greenScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // ACTIVITY STATISTICS
    totalActivities: {
      type: Number,
      default: 0,
      min: 0
    },

    totalEmission: {
      type: Number,
      default: 0,
      min: 0
    },

    lastActivityAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// =====================================
// DATABASE INDEXES
// =====================================

// Leaderboard sorting
userSchema.index({
  points: -1,
  greenScore: -1
});

// Role-based filtering
userSchema.index({
  role: 1
});

// Email is already indexed by unique: true

// =====================================
// PREVENT OVERWRITE MODEL ERROR
// =====================================

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

module.exports = User;
