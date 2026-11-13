
const mongoose = require("mongoose");

const userBadgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true
    },

    earnedAt: {
      type: Date,
      default: Date.now
    },

    // Tracks whether the user has seen the newly earned badge notification.
    notificationSeen: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// A user can earn the same badge only once.
userBadgeSchema.index(
  { user: 1, badge: 1 },
  { unique: true }
);

module.exports = mongoose.model("UserBadge", userBadgeSchema);
