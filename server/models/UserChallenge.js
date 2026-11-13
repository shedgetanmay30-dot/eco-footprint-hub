
const mongoose = require("mongoose");

const userChallengeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true
    },

    status: {
      type: String,
      enum: ["started", "completed"],
      default: "started"
    },

    currentProgress: {
      type: Number,
      default: 0,
      min: 0
    },

    targetProgress: {
      type: Number,
      required: true,
      min: 0.01
    },

    // Dates when the user completed daily check-ins.
    progressDates: {
      type: [Date],
      default: []
    },

    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// A user can join a particular challenge only once.
userChallengeSchema.index(
  { user: 1, challenge: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "UserChallenge",
  userChallengeSchema
);
